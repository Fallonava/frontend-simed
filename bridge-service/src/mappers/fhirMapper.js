const { R4 } = require('@ahryman40k/ts-fhir-types');

class FHIRMapper {
    /**
     * Convert SIMRS Patient to FHIR Patient Resource
     */
    static patientToFHIR(patient) {
        return {
            resourceType: 'Patient',
            identifier: [
                {
                    use: 'official',
                    system: 'http://sys-ids.kemkes.go.id/mr',
                    value: patient.no_rm
                },
                {
                    use: 'official',
                    system: 'https://fhir.kemkes.go.id/id/nik',
                    value: patient.nik
                }
            ],
            name: [{
                use: 'official',
                text: patient.name
            }],
            gender: patient.gender === 'L' ? 'male' : 'female',
            birthDate: new Date(patient.birth_date).toISOString().split('T')[0],
            address: patient.address ? [{
                use: 'home',
                text: patient.address,
                city: patient.city,
                postalCode: patient.postal_code
            }] : [],
            telecom: patient.phone ? [{
                system: 'phone',
                value: patient.phone,
                use: 'mobile'
            }] : []
        };
    }

    /**
     * Convert SIMRS Admission/Queue to FHIR Encounter
     */
    static encounterToFHIR(encounter, patientRef) {
        const encounterClass = encounter.poliklinik?.name?.toLowerCase().includes('igd')
            ? 'emergency'
            : encounter._isAdmitted ? 'inpatient' : 'ambulatory';

        return {
            resourceType: 'Encounter',
            status: encounter.status === 'ACTIVE' ? 'in-progress' : 'finished',
            class: {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: encounterClass,
                display: encounterClass.charAt(0).toUpperCase() + encounterClass.slice(1)
            },
            subject: {
                reference: `Patient/${patientRef}`
            },
            period: {
                start: new Date(encounter.check_in || encounter.created_at).toISOString(),
                end: encounter.check_out ? new Date(encounter.check_out).toISOString() : undefined
            },
            serviceProvider: {
                reference: 'Organization/{{ORGANIZATION_IHS_NUMBER}}'
            }
        };
    }

    /**
     * Convert Diagnosis to FHIR Condition
     */
    static conditionToFHIR(diagnosis, patientRef, encounterRef) {
        return {
            resourceType: 'Condition',
            clinicalStatus: {
                coding: [{
                    system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                    code: 'active',
                    display: 'Active'
                }]
            },
            code: {
                coding: [{
                    system: 'http://hl7.org/fhir/sid/icd-10',
                    code: diagnosis.icd10_code,
                    display: diagnosis.icd10_name
                }]
            },
            subject: {
                reference: `Patient/${patientRef}`
            },
            encounter: {
                reference: `Encounter/${encounterRef}`
            },
            recordedDate: new Date().toISOString()
        };
    }

    /**
     * Convert Vitals to FHIR Observation
     */
    static vitalToFHIR(vital, patientRef, encounterRef, type) {
        const loincCodes = {
            systolic: { code: '8480-6', display: 'Systolic blood pressure' },
            diastolic: { code: '8462-4', display: 'Diastolic blood pressure' },
            temperature: { code: '8310-5', display: 'Body temperature' },
            heart_rate: { code: '8867-4', display: 'Heart rate' },
            respiratory_rate: { code: '9279-1', display: 'Respiratory rate' },
            oxygen_saturation: { code: '2708-6', display: 'Oxygen saturation' }
        };

        const loinc = loincCodes[type];
        if (!loinc) return null;

        return {
            resourceType: 'Observation',
            status: 'final',
            category: [{
                coding: [{
                    system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                    code: 'vital-signs',
                    display: 'Vital Signs'
                }]
            }],
            code: {
                coding: [{
                    system: 'http://loinc.org',
                    code: loinc.code,
                    display: loinc.display
                }]
            },
            subject: {
                reference: `Patient/${patientRef}`
            },
            encounter: {
                reference: `Encounter/${encounterRef}`
            },
            effectiveDateTime: new Date().toISOString(),
            valueQuantity: {
                value: vital[type],
                unit: type === 'temperature' ? 'Cel' : type.includes('pressure') ? 'mm[Hg]' : type === 'heart_rate' ? '/min' : '%',
                system: 'http://unitsofmeasure.org'
            }
        };
    }

    /**
     * Convert Prescription to FHIR MedicationRequest
     */
    static medicationRequestToFHIR(prescriptionItem, patientRef, encounterRef, kfaCode) {
        return {
            resourceType: 'MedicationRequest',
            status: 'active',
            intent: 'order',
            medicationCodeableConcept: {
                coding: [{
                    system: 'http://sys-ids.kemkes.go.id/kfa',
                    code: kfaCode || 'UNKNOWN',
                    display: prescriptionItem.medicine.name
                }]
            },
            subject: {
                reference: `Patient/${patientRef}`
            },
            encounter: {
                reference: `Encounter/${encounterRef}`
            },
            authoredOn: new Date().toISOString(),
            dosageInstruction: [{
                text: `${prescriptionItem.dosage} - ${prescriptionItem.frequency}`,
                timing: {
                    repeat: {
                        frequency: parseInt(prescriptionItem.frequency) || 3,
                        period: 1,
                        periodUnit: 'd'
                    }
                }
            }],
            dispenseRequest: {
                quantity: {
                    value: prescriptionItem.quantity,
                    unit: 'TAB'
                }
            }
        };
    }
}

module.exports = FHIRMapper;
