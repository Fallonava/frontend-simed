class PrinterService {
    constructor() {
        this.device = null;
        this.interfaceNumber = 0;
        this.endpointOut = 0;
    }

    async connect() {
        try {
            if (!navigator.usb) {
                throw new Error('WebUSB not supported');
            }

            this.device = await navigator.usb.requestDevice({
                filters: [{ vendorId: 0x04b8 }] // Example: EPSON vendor ID. Remove filter to see all devices.
            });

            await this.device.open();
            await this.device.selectConfiguration(1);
            await this.device.claimInterface(this.interfaceNumber);

            return true;
        } catch (error) {
            console.error('Printer connection failed:', error);
            return false;
        }
    }

    async printTicket(ticket) {
        if (!this.device) {
            // Fallback to window.print if no WebUSB device
            this.printFallback(ticket);
            return;
        }

        try {
            const encoder = new TextEncoder();
            const commands = [
                // Init
                0x1B, 0x40,
                // Align Center
                0x1B, 0x61, 0x01,
                // Bold On
                0x1B, 0x45, 0x01,
                // Text
                ...encoder.encode('RUMAH SAKIT SEHAT\n'),
                ...encoder.encode('ANTRIAN POLIKLINIK\n\n'),
                // Bold Off
                0x1B, 0x45, 0x00,
                // Double Height/Width
                0x1D, 0x21, 0x11,
                ...encoder.encode(`${ticket.queue_code}\n`),
                // Normal Size
                0x1D, 0x21, 0x00,
                ...encoder.encode('\n'),
                ...encoder.encode(`Poli: ${ticket.daily_quota.doctor.poliklinik.name}\n`),
                ...encoder.encode(`Dokter: ${ticket.daily_quota.doctor.name}\n`),
                ...encoder.encode(`Sisa Antrian: ${ticket.queue_number - 1}\n\n`),
                ...encoder.encode(new Date().toLocaleString('id-ID') + '\n\n\n'),
                // Cut Paper
                0x1D, 0x56, 0x41, 0x10
            ];

            const data = new Uint8Array(commands);
            await this.device.transferOut(this.endpointOut, data);
        } catch (error) {
            console.error('Printing failed:', error);
            this.printFallback(ticket);
        }
    }

    printFallback(ticket) {
        const printWindow = window.open('', '', 'width=400,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <style>
                        body { font-family: monospace; text-align: center; padding: 20px; }
                        .title { font-size: 1.2em; font-weight: bold; }
                        .code { font-size: 3em; font-weight: bold; margin: 20px 0; }
                        .info { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="title">RUMAH SAKIT SEHAT</div>
                    <div class="title">ANTRIAN POLIKLINIK</div>
                    <div class="code">${ticket.queue_code}</div>
                    <div class="info">Poli: ${ticket.daily_quota.doctor.poliklinik.name}</div>
                    <div class="info">Dokter: ${ticket.daily_quota.doctor.name}</div>
                    <div class="info">Sisa Antrian: ${ticket.queue_number - 1}</div>
                    <div class="info">${new Date().toLocaleString('id-ID')}</div>
                    <script>
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
}

export default new PrinterService();
