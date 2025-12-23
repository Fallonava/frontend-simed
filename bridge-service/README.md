# Fallonava Bridge Service

Microservice for Indonesian Government Health Systems Integration (SATUSEHAT, SIRS, SISRUTE).

## Features

### SATUSEHAT Integration (HL7 FHIR R4)
- **Auto-sync** Patient, Practitioner, Encounter, Condition, Observation, MedicationRequest, Procedure
- **OAuth2 authentication** with automatic token refresh
- **Retry logic** with exponential backoff for resilience
- **KFA drug code mapping** for pharmaceutical compliance

### SIRS Automated Reporting
- Generate **RL1-RL5** monthly statistical reports
- Auto-calculate **service indicators** (BOR, ALOS, BTO, TOI, NDR, GDR)
- Export to **XML/Excel** format for government upload

### SISRUTE Referral System
- Webhook handler for **incoming referrals**
- Real-time **IGD alerts** via Socket.io
- Auto-respond with **bed availability** status

### Disease-Specific Systems
- **SITB**: Auto-detect and report TB cases (ICD-10: A15-A19)
- **SIHA**: VCT test results and ARV prescription reporting

### Dukcapil NIK Validation
- **Biometric verification** during patient registration
- Prevent identity fraud and ghost patients

## Architecture

```
bridge-service/
├── src/
│   ├── app.js              # Express server + Bull Board dashboard
│   ├── queues/             # BullMQ queue definitions
│   ├── workers/            # Background job processors
│   ├── mappers/            # FHIR/SIRS/SISRUTE data transformers
│   ├── integrations/       # API clients for government systems
│   └── utils/              # Winston logger
├── package.json
└── .env.example
```

## Installation

```bash
cd bridge-service
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
REDIS_URL=redis://localhost:6379
SATUSEHAT_CLIENT_ID=your_client_id
SATUSEHAT_CLIENT_SECRET=your_secret
SIRS_API_URL=https://sirs.kemkes.go.id/api
SISRUTE_API_KEY=your_sisrute_key
DATABASE_URL=postgresql://user:password@localhost:5432/dashboard_rs
```

## Running

### Development
```bash
# Start API server
npm run dev

# Start background workers
npm run worker
```

### Production (PM2)
```bash
pm2 start ecosystem.config.js
```

## Queue Dashboard

Access the Bull Board monitoring dashboard at:
```
http://localhost:4000/admin/queues
```

Monitor job status, retry counts, and error logs in real-time.

## API Endpoints

### Manual Sync Triggers

**POST** `/trigger/satusehat/sync`
```json
{
  "resourceType": "Patient",
  "resourceId": 1
}
```

**POST** `/trigger/sirs/generate-rl`
```json
{
  "reportType": "RL3",
  "month": 12,
  "year": 2023
}
```

### Webhook Receivers

**POST** `/webhook/sisrute/incoming-referral`
- Receives referral data from SISRUTE platform

## Offline Resilience

The service uses **Redis message queue** to handle offline scenarios:

1. **Internet down**: Jobs queue in Redis
2. **Government API unavailable**: Automatic retry with exponential backoff
3. **Server restart**: Jobs persist in Redis and resume automatically

## Monitoring

Integration health and logs are accessible via:
- **Frontend Dashboard**: `/integration` (requires ADMIN role)
- **Bull Board**: `http://localhost:4000/admin/queues`
- **Winston Logs**: `logs/combined.log` and `logs/error.log`

## Security Notes

> **IMPORTANT**: Never commit `.env` file. All credentials must be stored securely.

> **CAUTION**: SATUSEHAT requires **patient consent** before data transmission. Ensure consent checkbox is implemented in registration forms.

## Deployment Recommendations

- Run bridge service on **separate server/container** from main SIMRS
- Use **PM2** or **Docker** for process management
- Configure **Redis persistence** (AOF + RDB) for job durability
- Set up **monitoring alerts** for failed job queues

## License

Proprietary - Fallonava © 2024
