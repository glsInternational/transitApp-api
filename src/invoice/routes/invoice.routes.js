const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// CRUD INVOICE
router.post('/from-dossier/:dossierCode', invoiceController.createFromDossier);
router.put('/:id', invoiceController.updateInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;
