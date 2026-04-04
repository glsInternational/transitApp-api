const mongoose = require('mongoose');

const invoiceConfigSchema = new mongoose.Schema({
    footer: { type: String, default: "" },
    status: { type: String, default: "1" }
}, {
    timestamps: true
});

const InvoiceConfig = mongoose.model('acl_invoice_config', invoiceConfigSchema);
module.exports = { InvoiceConfig };
