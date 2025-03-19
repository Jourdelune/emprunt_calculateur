document.addEventListener('DOMContentLoaded', function() {
    // Récupération des périodicités
    const periodicites = {
        "mensuel": 12,
        "trimestriel": 4,
        "semestriel": 2,
        "annuel": 1
    };
    
    // Fonction pour formater les nombres en euros
    function formatMontant(montant) {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(montant);
    }
    
    // Fonction pour calculer le tableau d'amortissement
    function tableauEmprunt(mtn, taux, duration, periodicite, ammoConstant) {
        // Validation des entrées
        if (!periodicites.hasOwnProperty(periodicite)) {
            throw new Error("La périodicité n'est pas valide");
        }
        if (duration <= 0) {
            throw new Error("La durée doit être supérieure à 0");
        }
        if (mtn <= 0) {
            throw new Error("Le montant doit être supérieur à 0");
        }
        if (taux <= 0) {
            throw new Error("Le taux doit être supérieur à 0");
        }
        if (taux >= 1) {
            throw new Error("Le taux doit être inférieur à 1");
        }
        
        // Conversion de la durée en périodes
        const nbPeriodes = duration * periodicites[periodicite];
        
        let tauxPeriodique;
        switch(periodicite) {
            case "mensuel":
                tauxPeriodique = Math.pow(1 + taux, 1/12) - 1;
                break;
            case "trimestriel":
                tauxPeriodique = Math.pow(1 + taux, 1/4) - 1;
                break;
            case "semestriel":
                tauxPeriodique = Math.pow(1 + taux, 1/2) - 1;
                break;
            case "annuel":
                tauxPeriodique = taux;
                break;
        }
        
        let capitalRestant = mtn;
        let amortissement;
        let annuite;
        
        if (ammoConstant) {
            amortissement = mtn / nbPeriodes;
        } else {
            annuite = mtn * (tauxPeriodique / (1 - Math.pow(1 + tauxPeriodique, -nbPeriodes)));
        }
        
        const resultats = [];
        let totalInterets = 0;
        let totalAmortissements = 0;
        let totalAnnuites = 0;
        
        for (let i = 0; i < nbPeriodes; i++) {
            const interet = capitalRestant * tauxPeriodique;
            
            if (ammoConstant) {
                annuite = interet + amortissement;
            } else {
                amortissement = annuite - interet;
            }
            
            capitalRestant -= amortissement;
            
            // Correction pour éviter les erreurs d'arrondi à la fin
            if (i === nbPeriodes - 1 && Math.abs(capitalRestant) < 0.01) {
                capitalRestant = 0;
            }
            
            totalInterets += interet;
            totalAmortissements += amortissement;
            totalAnnuites += annuite;
            
            const periode = periodicite === "mensuel" 
                ? `Mois ${i + 1}` 
                : periodicite === "trimestriel" 
                    ? `Trimestre ${i + 1}` 
                    : periodicite === "semestriel" 
                        ? `Semestre ${i + 1}` 
                        : `Année ${i + 1}`;
                        
            const anneeEquivalente = Math.floor(i / periodicites[periodicite]) + 1;
            const periodeEquivalente = i % periodicites[periodicite] + 1;
            
            const periodeAffichee = periodicite === "annuel" 
                ? `Année ${i + 1}` 
                : `Année ${anneeEquivalente} - ${
                    periodicite === "mensuel" ? `Mois ${periodeEquivalente}` : 
                    periodicite === "trimestriel" ? `Trim. ${periodeEquivalente}` : 
                    `Sem. ${periodeEquivalente}`
                }`;
            
            resultats.push({
                periode: periodeAffichee,
                annuite: annuite,
                interet: interet,
                amortissement: amortissement,
                capitalRestant: capitalRestant
            });
        }
        
        return {
            tableau: resultats,
            resume: {
                coutTotal: totalAnnuites,
                totalInterets: totalInterets,
                montantEmprunte: mtn,
                mensualiteMoyenne: totalAnnuites / nbPeriodes
            }
        };
    }
    
    // Fonction pour afficher le tableau d'amortissement
    function afficherTableau(resultats) {
        const tbody = document.querySelector('#tableau-amortissement tbody');
        tbody.innerHTML = '';
        
        resultats.tableau.forEach(ligne => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${ligne.periode}</td>
                <td>${formatMontant(ligne.annuite)}</td>
                <td>${formatMontant(ligne.interet)}</td>
                <td>${formatMontant(ligne.amortissement)}</td>
                <td>${formatMontant(ligne.capitalRestant)}</td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Mise à jour du résumé
        document.getElementById('cout-total').textContent = formatMontant(resultats.resume.coutTotal);
        document.getElementById('total-interets').textContent = formatMontant(resultats.resume.totalInterets);
        document.getElementById('mensualite-moyenne').textContent = formatMontant(resultats.resume.mensualiteMoyenne);
    }
    
    // Événement de clic sur le bouton "Calculer"
    document.getElementById('calculer').addEventListener('click', function() {
        try {
            const montant = parseFloat(document.getElementById('montant').value);
            const taux = parseFloat(document.getElementById('taux').value) / 100; // Conversion du pourcentage en décimal
            const duree = parseInt(document.getElementById('duree').value);
            const periodicite = document.getElementById('periodicite').value;
            const ammoConstant = document.getElementById('amortissement_constant').checked;
            
            const resultats = tableauEmprunt(montant, taux, duree, periodicite, ammoConstant);
            afficherTableau(resultats);
        } catch (error) {
            alert('Erreur : ' + error.message);
        }
    });
    
    // Calculer au chargement avec les valeurs par défaut
    document.getElementById('calculer').click();
    });