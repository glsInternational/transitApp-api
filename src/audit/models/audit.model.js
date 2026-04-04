const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    administrateur: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    action: { 
        type: String, 
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
    },
    module: { 
        type: String, 
        required: true 
    },
    details: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    },
    ip: { 
        type: String, 
        default: 'unknown' 
    },
    userAgent: {
        type: String,
        default: 'unknown'
    }
}, {
    timestamps: { createdAt: true, updatedAt: false } // Only need createdAt for logs
});

const Audit = mongoose.model('acl_audit_logs', auditSchema);
module.exports = { Audit };
