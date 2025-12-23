const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const FHIRMapper = require('../mappers/fhirMapper');
const satusehatClient = require('../integrations/satusehat');
const logger = require('../utils/logger');

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const satusehatWorker = new Worker('satusehat-sync', async (job) => {
    const { resourceType, resourceId } = job.data;
    logger.info(`Processing SATUSEHAT sync job`, { resourceType, resourceId });

    try {
        let fhirResource;
        let localData;

        switch (resourceType) {
            case 'Patient':
                localData = await prisma.patient.findUnique({ where: { id: resourceId } });
                fhirResource = FHIRMapper.patientToFHIR(localData);
                break;

            case 'Encounter':
                localData = await prisma.admission.findUnique({
                    where: { id: resourceId },
                    include: { patient: true, bed: { include: { room: true } } }
                });

                // Get or create patient reference
                const patientSatusehat = await getOrCreatePatientResource(localData.patient);
                fhirResource = FHIRMapper.encounterToFHIR(localData, patientSatusehat.id);
                break;

            case 'Condition':
                localData = await prisma.medicalRecord.findUnique({
                    where: { id: resourceId },
                    include: { patient: true, queue: true }
                });

                const patientRef = await getOrCreatePatientResource(localData.patient);
                const encounterRef = await getOrCreateEncounterResource(localData.queue || localData.admission);

                fhirResource = FHIRMapper.conditionToFHIR({
                    icd10_code: localData.diagnosa_code,
                    icd10_name: localData.diagnosa
                }, patientRef.id, encounterRef.id);
                break;

            default:
                throw new Error(`Unknown resource type: ${resourceType}`);
        }

        // Send to SATUSEHAT
        const result = await satusehatClient.createResource(resourceType, fhirResource);

        // Log success
        await prisma.integrationLog.create({
            data: {
                system: 'SATUSEHAT',
                resource_type: resourceType,
                resource_id: resourceId,
                status: 'SUCCESS',
                request_body: fhirResource,
                response_body: result
            }
        });

        // Store mapping
        await prisma.satusehatResource.upsert({
            where: {
                resource_type_local_id: {
                    resource_type: resourceType,
                    local_id: resourceId
                }
            },
            update: {
                satusehat_id: result.id,
                last_synced: new Date()
            },
            create: {
                resource_type: resourceType,
                local_id: resourceId,
                satusehat_id: result.id
            }
        });

        logger.info(`Successfully synced ${resourceType}/${resourceId} to SATUSEHAT`);
        return result;
    } catch (error) {
        // Log failure
        await prisma.integrationLog.create({
            data: {
                system: 'SATUSEHAT',
                resource_type: resourceType,
                resource_id: resourceId,
                status: 'FAILED',
                error_message: error.message,
                retry_count: job.attemptsMade
            }
        });

        logger.error(`Failed to sync ${resourceType}/${resourceId}`, error);
        throw error; // Will trigger retry
    }
}, { connection });

async function getOrCreatePatientResource(patient) {
    const existing = await prisma.satusehatResource.findFirst({
        where: { resource_type: 'Patient', local_id: patient.id }
    });

    if (existing) {
        return { id: existing.satusehat_id };
    }

    // Queue patient sync if not exists
    const fhirPatient = FHIRMapper.patientToFHIR(patient);
    const result = await satusehatClient.createResource('Patient', fhirPatient);

    await prisma.satusehatResource.create({
        data: {
            resource_type: 'Patient',
            local_id: patient.id,
            satusehat_id: result.id
        }
    });

    return result;
}

async function getOrCreateEncounterResource(encounter) {
    const existing = await prisma.satusehatResource.findFirst({
        where: { resource_type: 'Encounter', local_id: encounter.id }
    });

    if (existing) {
        return { id: existing.satusehat_id };
    }

    // Create encounter (requires patient)
    const patient = await prisma.patient.findUnique({ where: { id: encounter.patient_id } });
    const patientRef = await getOrCreatePatientResource(patient);

    const fhirEncounter = FHIRMapper.encounterToFHIR(encounter, patientRef.id);
    const result = await satusehatClient.createResource('Encounter', fhirEncounter);

    await prisma.satusehatResource.create({
        data: {
            resource_type: 'Encounter',
            local_id: encounter.id,
            satusehat_id: result.id
        }
    });

    return result;
}

satusehatWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed`);
});

satusehatWorker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts`, err);
});

module.exports = satusehatWorker;
