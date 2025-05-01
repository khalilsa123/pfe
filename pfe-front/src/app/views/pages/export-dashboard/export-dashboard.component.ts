// export-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComptageService } from '../../../services/comptage.service';
import { ResultService } from '../../../services/result.service';
import { Comptage } from '../../../models/comptage.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-export-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="export-container">
      <!-- Affichage du chargement -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p>Préparation de l'export...</p>
      </div>

      <!-- Contenu de l'export -->
      <div *ngIf="!isLoading" class="export-content">
        <div class="export-options">
          <h3>Type de comptage à exporter</h3>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="radio" name="exportType" id="exportType1" 
                   [(ngModel)]="exportType" value="comptage1">
            <label class="form-check-label" for="exportType1">
              Premier Comptage
            </label>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="radio" name="exportType" id="exportType2" 
                   [(ngModel)]="exportType" value="comptage2">
            <label class="form-check-label" for="exportType2">
              Deuxième Comptage
            </label>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="radio" name="exportType" id="exportType3" 
                   [(ngModel)]="exportType" value="comptage3">
            <label class="form-check-label" for="exportType3">
              Troisième Comptage
            </label>
          </div>
          
          <div class="form-check mb-4">
            <input class="form-check-input" type="radio" name="exportType" id="exportTypeF" 
                   [(ngModel)]="exportType" value="final">
            <label class="form-check-label" for="exportTypeF">
              <strong>Résultat Final</strong>
            </label>
          </div>
          
          <h3>Options d'export</h3>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="includeInvalid" 
                   [(ngModel)]="includeInvalid">
            <label class="form-check-label" for="includeInvalid">
              Inclure les comptages invalides
            </label>
          </div>
          
          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="includeOperator" 
                   [(ngModel)]="includeOperator">
            <label class="form-check-label" for="includeOperator">
              Inclure le nom des opérateurs
            </label>
          </div>
          
          <div class="filename-container mb-4">
            <label for="filename" class="form-label">Nom du fichier</label>
            <div class="input-group">
              <input type="text" class="form-control" id="filename" 
                     [(ngModel)]="filename">
              <span class="input-group-text">.xlsx</span>
            </div>
          </div>
        </div>
        
        <div class="preview-container">
          <h3>Aperçu</h3>
          <div class="preview-table-container">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Lot</th>
                  <th>Sous-lot</th>
                  <th>Poids (g)</th>
                  <th *ngIf="includeOperator">Opérateur</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of previewData">
                  <td>{{ item.reference }}</td>
                  <td>{{ item.lot }}</td>
                  <td>{{ item.sousLot }}</td>
                  <td>{{ item.poids }}</td>
                  <td *ngIf="includeOperator">{{ item.operateur }}</td>
                </tr>
                <tr *ngIf="previewData.length === 0">
                  <td colspan="5" class="text-center py-3">
                    Aucune donnée disponible pour ce type d'export
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div class="export-count">
              {{ previewData.length }} élément(s) à exporter
            </div>
            <button class="btn btn-export" 
                    [disabled]="previewData.length === 0"
                    (click)="exportToExcel()">
              <i class="fas fa-file-excel me-2"></i> Générer Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .export-container {
      padding: 15px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      
      p {
        margin-top: 15px;
        color: var(--onetech-blue);
        font-weight: 500;
      }
    }
    
    .export-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
      
      @media (max-width: 992px) {
        grid-template-columns: 1fr;
      }
      
      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--onetech-dark-blue);
        margin-bottom: 15px;
      }
    }
    
    .export-options {
      padding-right: 20px;
      border-right: 1px solid #e9ecef;
      
      @media (max-width: 992px) {
        padding-right: 0;
        border-right: none;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 20px;
      }
      
      .form-check-label {
        cursor: pointer;
      }
      
      .form-check-input:checked {
        background-color: var(--onetech-blue);
        border-color: var(--onetech-blue);
      }
    }
    
    .preview-container {
      .preview-table-container {
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #e9ecef;
        border-radius: 5px;
        
        table {
          margin-bottom: 0;
          
          th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 1;
          }
        }
      }
      
      .export-count {
        color: #6c757d;
        font-size: 0.9rem;
      }
      
      .btn-export {
        background-color: var(--onetech-orange);
        color: white;
        transition: all 0.2s ease;
        
        &:hover {
          background-color: darken(#FF6D0A, 5%);
          transform: translateY(-2px);
        }
        
        &:disabled {
          background-color: #adb5bd;
          cursor: not-allowed;
        }
      }
    }
    
    .filename-container {
      .input-group-text {
        background-color: #f1f5f9;
        color: #64748b;
      }
    }
  `]
})
export class ExportDashboardComponent implements OnInit {
  exportType: 'comptage1' | 'comptage2' | 'comptage3' | 'final' = 'final';
  includeInvalid = false;
  includeOperator = true;
  isLoading = false;
  
  // Données et fichier
  comptages: Comptage[] = [];
  previewData: any[] = [];
  filename = 'resultat-comptage-' + new Date().toISOString().substring(0, 10);

  constructor(
    private comptageService: ComptageService,
    private resultService: ResultService
  ) {}

  ngOnInit(): void {
    this.loadComptages();
  }

  loadComptages(): void {
    this.isLoading = true;
    this.comptageService.getAllComptages().subscribe({
      next: (data: Comptage[]) => {
        this.comptages = data;
        this.updatePreview();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement des comptages', err);
        this.isLoading = false;
      }
    });
  }
  
  updatePreview(): void {
    this.previewData = [];
    
    // Structure pour regrouper les comptages par référence
    const comptageGroups = new Map<string, Comptage[]>();
    
    // Grouper par référence (ref$lot$sous)
    this.comptages.forEach(comptage => {
      const parts = comptage.reference.split('$');
      if (parts.length < 4) return;
      
      const ref = parts[0];
      const lot = parts[2];
      const sousLot = parts[3];
      const groupKey = `${ref}$${lot}$${sousLot}`;
      
      if (!comptageGroups.has(groupKey)) {
        comptageGroups.set(groupKey, []);
      }
      
      comptageGroups.get(groupKey)!.push(comptage);
    });
    
    // Créer les données d'aperçu selon le type d'export
    comptageGroups.forEach((comptages, groupKey) => {
      const parts = groupKey.split('$');
      const reference = parts[0];
      const lot = parts[1];
      const sousLot = parts[2];
      
      // Trier les comptages par numComptage
      comptages.sort((a, b) => a.numComptage - b.numComptage);
      
      let comptage1 = comptages.find(c => c.numComptage === 1);
      let comptage2 = comptages.find(c => c.numComptage === 2);
      let comptage3 = comptages.find(c => c.numComptage === 3);
      
      // Déterminer le résultat final
      let poidsFinal: number | undefined;
      let operateurFinal: string | undefined;
      let isValid = false;
      
      if (comptage1 && comptage2) {
        const poids1 = comptage1.poids;
        const poids2 = comptage2.poids;
        const maxPoids = Math.max(poids1, poids2);
        
        const difference = maxPoids === 0 ? 0 : Math.abs(poids1 - poids2) / maxPoids * 100;
        
        if (difference < 5) {
          poidsFinal = Math.min(poids1, poids2);
          operateurFinal = poids1 <= poids2 
            ? this.getOperatorName(comptage1.operateurId!)
            : this.getOperatorName(comptage2.operateurId!);
          isValid = true;
        } else if (comptage3) {
          poidsFinal = comptage3.poids;
          operateurFinal = this.getOperatorName(comptage3.operateurId!);
          isValid = true;
        }
      }
      
      // Créer l'objet pour l'aperçu selon le type d'export sélectionné
      let previewItem: any;
      
      switch (this.exportType) {
        case 'comptage1':
          if (comptage1) {
            previewItem = {
              reference: reference,
              lot: lot,
              sousLot: sousLot,
              poids: comptage1.poids,
              operateur: this.getOperatorName(comptage1.operateurId!)
            };
          }
          break;
          
        case 'comptage2':
          if (comptage2) {
            previewItem = {
              reference: reference,
              lot: lot,
              sousLot: sousLot,
              poids: comptage2.poids,
              operateur: this.getOperatorName(comptage2.operateurId!)
            };
          }
          break;
          
        case 'comptage3':
          if (comptage3) {
            previewItem = {
              reference: reference,
              lot: lot,
              sousLot: sousLot,
              poids: comptage3.poids,
              operateur: this.getOperatorName(comptage3.operateurId!)
            };
          }
          break;
          
        case 'final':
          if (poidsFinal !== undefined) {
            previewItem = {
              reference: reference,
              lot: lot,
              sousLot: sousLot,
              poids: poidsFinal,
              operateur: operateurFinal || 'N/A',
              isValid: isValid
            };
          } else if (this.includeInvalid) {
            previewItem = {
              reference: reference,
              lot: lot,
              sousLot: sousLot,
              poids: 'Non valide',
              operateur: 'N/A',
              isValid: false
            };
          }
          break;
      }
      
      // Ajouter à l'aperçu si valide ou si on inclut les invalides
      if (previewItem && (isValid || this.includeInvalid)) {
        this.previewData.push(previewItem);
      }
    });
    
    // Trier les données par référence
    this.previewData.sort((a, b) => {
      return a.reference.localeCompare(b.reference) || 
             a.lot.localeCompare(b.lot) || 
             a.sousLot.localeCompare(b.sousLot);
    });
  }
  
  // Helper pour obtenir le nom de l'opérateur
  getOperatorName(operateurId: number): string {
    // Dans une implémentation réelle, cette méthode devrait récupérer le nom de l'opérateur
    return `Opérateur #${operateurId}`;
  }
  
  // Export Excel
  exportToExcel(): void {
    this.isLoading = true;
    
    try {
      // Créer les données pour l'export
      const exportData = this.previewData.map(item => {
        const exportItem: any = {
          'Référence': item.reference,
          'Lot': item.lot,
          'Sous-lot': item.sousLot,
          'Poids (g)': item.poids
        };
        
        if (this.includeOperator) {
          exportItem['Opérateur'] = item.operateur;
        }
        
        return exportItem;
      });
      
      // Créer le workbook et la worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Ajouter la worksheet au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Comptages');
      
      // Générer le fichier
      XLSX.writeFile(wb, `${this.filename}.xlsx`);
    } catch (err) {
      console.error('Erreur lors de l\'export Excel', err);
    } finally {
      this.isLoading = false;
    }
  }
}