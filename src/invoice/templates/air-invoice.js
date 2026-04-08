const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CI', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatCurrencyWithDecimals = (amount) => {
    return new Intl.NumberFormat('fr-CI', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
};

const airInvoiceTemplate = (invoice) => {
    const isProforma = invoice.type === 'proforma';
    const title = isProforma ? 'FACTURE PROFORMA' : 'FACTURE DÉFINITIVE';
    const primaryColor = '#00a651'; // Le vert du logo GLS
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${title} - ${invoice.invoiceNumber}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        
        body {
            font-family: 'Roboto', sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            background-color: #f0f0f0;
            font-size: 10px;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 10mm auto;
            background: #fff;
            padding: 10mm;
            box-sizing: border-box;
            position: relative;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .logo-box {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-text-big {
            font-size: 48px;
            font-weight: 900;
            color: ${primaryColor};
            letter-spacing: -2px;
        }

        .company-name-header {
            font-size: 14px;
            font-weight: 700;
            color: #333;
        }

        .invoice-title-container {
            text-align: center;
            margin: 20px 0 10px 0;
        }

        .invoice-title {
            font-size: 20px;
            font-weight: 900;
            text-decoration: underline;
            margin: 0;
        }

        .invoice-date-top {
            text-align: right;
            font-size: 9px;
            margin-bottom: 5px;
        }

        .red-bar {
            height: 15px;
            background: #ff0000;
            width: 180px;
            margin: 5px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
        }

        .main-layout {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: 20px;
        }

        /* Sidebar Side */
        .sidebar {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .sidebar-box {
            border: 1px solid #000;
        }

        .sidebar-header {
            background: #cccccc;
            text-align: center;
            font-weight: 700;
            padding: 2px;
            border-bottom: 1px solid #000;
            font-size: 8px;
        }

        .sidebar-content {
            text-align: center;
            padding: 5px;
            font-weight: 700;
            font-size: 11px;
            min-height: 15px;
        }

        .sidebar-grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 1px solid #000;
        }

        .sidebar-grid-2 > div {
            border-right: 1px solid #000;
        }

        .sidebar-grid-2 > div:last-child {
            border-right: none;
        }

        /* Tables Side */
        .content-area {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .client-box {
            border: 1px solid #000;
            margin-bottom: 10px;
            margin-left: auto;
            width: 250px;
        }

        .table-container {
            width: 100%;
            border: 1px solid #000;
            border-collapse: collapse;
        }

        .table-container th, .table-container td {
            border: 1px solid #000;
            padding: 2px 5px;
            text-align: left;
        }

        .table-header-row {
            background: #333;
            color: #fff;
            font-weight: 700;
            font-size: 9px;
        }

        .table-section-title {
            background: #999999;
            font-weight: 800;
            text-decoration: underline;
        }

        .amount-col {
            text-align: right !important;
            width: 80px;
        }

        .subtotal-row {
            font-weight: 700;
            font-style: italic;
        }

        .total-row-black {
            background: #333;
            color: #fff;
            font-weight: 800;
        }

        .grand-total-section {
            margin-top: 10px;
            border: 2px solid #000;
        }

        .grand-total-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 5px;
            border-bottom: 1px solid #000;
        }

        .grand-total-row:last-child {
            border-bottom: none;
        }

        .label-total {
            font-weight: 700;
        }

        .value-total {
            font-weight: 700;
        }

        .net-to-pay {
            background: #cccccc;
            font-size: 14px;
            padding: 8px 5px;
        }

        .footer-text {
            margin-top: 20px;
            font-size: 8px;
            text-align: justify;
        }

        .company-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 7px;
            border-top: 1px solid #ccc;
            padding-top: 5px;
            color: #666;
        }

        @media print {
            body { background: #fff; }
            .page { margin: 0; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo-box">
                <div class="logo-text-big">GLS</div>
                <div class="company-name-header">GENERAL LOGISTICS SYSTEMS <span style="font-size: 8px; vertical-align: top;">SARL</span></div>
            </div>
            <div class="invoice-date-top">
                ${new Date(invoice.dateInvoice).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>

        <div class="invoice-title-container">
            <h1 class="invoice-title">${title}</h1>
        </div>

        <div class="main-layout">
            <!-- SIDEBAR -->
            <div class="sidebar">
                <div class="red-bar">${invoice.type === 'proforma' ? '0' : invoice.invoiceNumber}</div>

                <div class="sidebar-box">
                    <div class="sidebar-header">AWB</div>
                    <div class="sidebar-content">${invoice.dossierInfo?.awb_bl || 'XXXDXXX'}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-grid-2">
                        <div class="sidebar-header">Colis</div>
                        <div class="sidebar-header">PB</div>
                    </div>
                    <div class="sidebar-grid-2">
                        <div class="sidebar-content">${invoice.dossierInfo?.colis || 'XX'}</div>
                        <div class="sidebar-content">${invoice.dossierInfo?.poids || 'X'}</div>
                    </div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Description Marchandise</div>
                    <div class="sidebar-content" style="font-size: 9px; text-transform: uppercase;">${invoice.dossierInfo?.description || 'DESCRIPTION'}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-grid-2">
                        <div class="sidebar-header">Date d'arrivée</div>
                        <div class="sidebar-header">Origine</div>
                    </div>
                    <div class="sidebar-grid-2">
                        <div class="sidebar-content">XXXXX</div>
                        <div class="sidebar-content">${invoice.dossierInfo?.provenance || 'XXX'}</div>
                    </div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Expéditeur</div>
                    <div class="sidebar-content" style="font-size: 9px;">${invoice.dossierInfo?.expediteur || 'XXXXXXX'}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-grid-2">
                        <div class="sidebar-header">Inco-term</div>
                        <div class="sidebar-header">Devise</div>
                    </div>
                    <div class="sidebar-grid-2">
                        <div class="sidebar-content">${invoice.dossierInfo?.incoterm || 'X'}</div>
                        <div class="sidebar-content">${invoice.dossierInfo?.devise || 'XOF'}</div>
                    </div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-grid-2">
                        <div class="sidebar-header">Total Valeur Facture (XOF)</div>
                        <div class="sidebar-header">Cours</div>
                    </div>
                    <div class="sidebar-grid-2">
                        <div class="sidebar-content">${formatCurrencyWithDecimals(invoice.dossierInfo?.valeur_fob_xof)}</div>
                        <div class="sidebar-content">1,00</div>
                    </div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-grid-2">
                        <div class="sidebar-header">Valeur FOB Déclarante (XOF)</div>
                        <div class="sidebar-header">Valeur FOB déclarée (XOF)</div>
                    </div>
                    <div class="sidebar-grid-2">
                        <div class="sidebar-content">${formatCurrency(invoice.dossierInfo?.valeur_fob_xof)}</div>
                        <div class="sidebar-content">${formatCurrency(invoice.dossierInfo?.valeur_fob_xof)}</div>
                    </div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Valeur CAF Déclarée (XOF)</div>
                    <div class="sidebar-content">${formatCurrency(invoice.dossierInfo?.valeur_caf_xof)}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Régime douanier</div>
                    <div class="sidebar-content">${invoice.dossierInfo?.regime_douanier || 'N/A'}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Bureau Douane</div>
                    <div class="sidebar-content">${invoice.dossierInfo?.bureau_douane || '0'}</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">Type de facturation</div>
                    <div class="sidebar-content">Tarif Comptant</div>
                </div>

                <div class="sidebar-box">
                    <div class="sidebar-header">N° Dossier</div>
                    <div class="sidebar-content">${invoice.dossierInfo?.num_dossier || '0'}</div>
                </div>
            </div>

            <!-- CONTENT TABLES -->
            <div class="content-area">
                <div class="client-box">
                    <div class="sidebar-header">Client</div>
                    <div class="sidebar-content" style="padding: 15px; font-size: 14px;">${invoice.dossierInfo?.client || 'PARTICULIER'}</div>
                </div>

                <table class="table-container">
                    <tr class="table-header-row">
                        <th>DROITS & TAXES DE DOUANE</th>
                        <th class="amount-col">XOF</th>
                    </tr>
                    <tr>
                        <td>DD - Droit de Douane</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.dd)}</td>
                    </tr>
                    <tr>
                        <td>RSTA - Redevance Statistique</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.rsta)}</td>
                    </tr>
                    <tr>
                        <td>PCS - Prélèvement Communautaire de Solidarité</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.pcs)}</td>
                    </tr>
                    <tr>
                        <td>PCC - Prélèvement Communautaire Cedeao</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.pcc)}</td>
                    </tr>
                    <tr>
                        <td>PUA - Prélèvement Union Africaine</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.pua)}</td>
                    </tr>
                    <tr>
                        <td>Autres Taxes 1 (soumise à TVA)</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.autres_taxes_tva)}</td>
                    </tr>
                    <tr>
                        <td>Autres Taxes 2 (non soumise à TVA)</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.autres_taxes_non_tva)}</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td>Sous-Total Droits et Taxes hors TVA</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.subtotal_ht)}</td>
                    </tr>
                    <tr>
                        <td>TVA sur Droits et Taxes</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.tva_douane)}</td>
                    </tr>
                    <tr class="total-row-black">
                        <td>TOTAL Droits et Taxes</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.total_douane)}</td>
                    </tr>
                    <tr>
                        <td>TS Douane</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.ts_douane)}</td>
                    </tr>
                    <tr>
                        <td>RPI - Redevances Procédures Import</td>
                        <td class="amount-col">${formatCurrency(invoice.douaneTaxes?.rpi)}</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td>Sous-Total Taxes Déclaration</td>
                        <td class="amount-col">${formatCurrency((invoice.douaneTaxes?.ts_douane || 0) + (invoice.douaneTaxes?.rpi || 0))}</td>
                    </tr>
                    <tr class="total-row-black">
                        <td>TOTAL DECLARATION</td>
                        <td class="amount-col">${formatCurrency((invoice.douaneTaxes?.total_douane || 0) + (invoice.douaneTaxes?.ts_douane || 0) + (invoice.douaneTaxes?.rpi || 0))}</td>
                    </tr>
                </table>

                <table class="table-container">
                    <tr class="table-header-row">
                        <th>DEBOURS DIVERS</th>
                        <th class="amount-col">XOF</th>
                    </tr>
                    <tr>
                        <td>Agio (0,2% Total Déclaration)</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.agio)}</td>
                    </tr>
                    <tr>
                        <td>Gestion Crédit d'Enlèvement (0,4%)</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.gestion_credit)}</td>
                    </tr>
                    <tr>
                        <td>Edition Déclaration</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.edition_declaration)}</td>
                    </tr>
                    <tr>
                        <td>Sortie provisoire</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.sortie_provisoire)}</td>
                    </tr>
                    <tr>
                        <td>Passage Douane</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.passage_douane)}</td>
                    </tr>
                    <tr>
                        <td>Dépôt Douane</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.depot_douane)}</td>
                    </tr>
                    <tr>
                        <td>Amende douane</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.amende_douane)}</td>
                    </tr>
                    <tr>
                        <td>Retrait documentaire</td>
                        <td class="amount-col"></td>
                    </tr>
                    <tr>
                        <td>COC</td>
                        <td class="amount-col"></td>
                    </tr>
                    <tr>
                        <td>Prime d'Assurance</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.assurance)}</td>
                    </tr>
                    <tr>
                        <td>Autres Débours</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.autres)}</td>
                    </tr>
                    <tr class="total-row-black">
                        <td>TOTAL DEBOURS DIVERS</td>
                        <td class="amount-col">${formatCurrency(invoice.debours?.total_debours)}</td>
                    </tr>
                </table>

                <table class="table-container">
                    <tr class="table-header-row">
                        <th>PRESTATIONS TRANSIT</th>
                        <th class="amount-col">XOF</th>
                    </tr>
                    <tr>
                        <td>Frais Fixes Dossier</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.frais_fixes)}</td>
                    </tr>
                    <tr>
                        <td>Edition Déclarations</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.edition_decl)}</td>
                    </tr>
                    <tr>
                        <td>HAD</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.had)}</td>
                    </tr>
                    <tr>
                        <td>Commission Gestion de Dossier (2%)</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.commission_gestion)}</td>
                    </tr>
                    <tr>
                        <td>Escorte Douane</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.escorte)}</td>
                    </tr>
                    <tr>
                        <td>FDI - Fiche de Déclaration à l'importation</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.fdi)}</td>
                    </tr>
                    <tr>
                        <td>Livraison</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.livraison)}</td>
                    </tr>
                    <tr class="subtotal-row">
                        <td>Sous-Total Prestations Transit</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.total_prestations)}</td>
                    </tr>
                    <tr>
                        <td>Frais Fixes Déclaration Simplifiée</td>
                        <td class="amount-col"></td>
                    </tr>
                    <tr>
                        <td>Frais de Remise documentaire</td>
                        <td class="amount-col"></td>
                    </tr>
                    <tr>
                        <td>Frais de Magasinage</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.frais_magasinage_comm)}</td>
                    </tr>
                    <tr>
                        <td>Commission sur Avance de fonds (2%)</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.comm_avance_fonds)}</td>
                    </tr>
                    <tr class="total-row-black">
                        <td>TOTAL PRESTATIONS TRANSIT</td>
                        <td class="amount-col">${formatCurrency(invoice.prestations?.total_prestations)}</td>
                    </tr>
                </table>

                <div class="grand-total-section">
                    <div class="grand-total-row">
                        <span class="label-total">TOTAL FACTURE HORS TVA</span>
                        <span class="value-total">${formatCurrency(invoice.totals?.total_ht)}</span>
                    </div>
                    <div class="grand-total-row">
                        <span class="label-total">TVA sur Prestations 18%</span>
                        <span class="value-total">${formatCurrency(invoice.totals?.tva_prestation)}</span>
                    </div>
                    <div class="grand-total-row">
                        <span class="label-total">TOTAL TTC</span>
                        <span class="value-total">${formatCurrency(invoice.totals?.total_ttc)}</span>
                    </div>
                    <div class="grand-total-row">
                        <span class="label-total">Avance</span>
                        <span class="value-total">${formatCurrency(invoice.totals?.avance)}</span>
                    </div>
                    <div class="grand-total-row net-to-pay">
                        <span class="label-total">TOTAL A PAYER</span>
                        <span class="value-total">${formatCurrency(invoice.totals?.net_a_payer)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer-text">
            Arrêté la présente facture ${isProforma ? 'proforma' : 'définitive'} à la somme de : ${formatCurrency(invoice.totals?.net_a_payer)} XOF (Somme en toutes lettres). ${isProforma ? 'La facture définitive pourrait connaître des variations à la hausse ou à la baisse, indépendants de GLS. Facture proforma valable 5 jours ; au-delà du ' + new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString('fr-FR') + ', prière recontacter le Service Transit pour une facture proforma actualisée.' : ''}
        </div>

        <div class="company-footer">
            GENERAL LOGISTICS SYSTEMS SARL<br>
            SIEGE: PORT BOUET - ZONE AERO PORTUAIRE - Capital: 1 000 000 F CFA - 12 BP 2417 Abidjan 12 - CC N : 1744243 P<br>
            RCCM N : CI-ABJ-2017-B-24986 - Tél: 225 07469346 / 40191207 - E-mail : gls.ci@yahoo.com<br>
            BANK OF AFRICA N : CI032 01023 009385030005 85
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { airInvoiceTemplate };
