import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperatorService } from '../../services/operator.service';
import { Comptage }        from '../../models/comptage.model';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
  comptages: Comptage[] = [];
  currentOperatorId = 1; // à remplacer par ton AuthService

  constructor(private operatorService: OperatorService) {}

  ngOnInit(): void {
    this.loadComptages();
  }

  loadComptages(): void {
    this.operatorService.getComptages(this.currentOperatorId).subscribe({
      next: data => this.comptages = data,
      error: err  => console.error('Erreur chargement', err)
    });
  }

  addComptage(): void {
    // — on récupère tous les champs manuellement
    const emplacement   = prompt('Emplacement :');
    if (emplacement === null) return;
    const reference     = prompt('Référence :');
    if (reference === null) return;
    const numLot        = prompt('Numéro de lot :');
    if (numLot === null) return;
    const numSousLot    = prompt('Numéro de sous‑lot :');
    if (numSousLot === null) return;
    const typeMatiere   = prompt('Type de matière :');
    if (typeMatiere === null) return;
    const poidsStr      = prompt('Poids (g) :', '0');
    const quantiteStr   = prompt('Quantité totale :', '0');
    const numCompStr    = prompt('Numéro de comptage (1,2 ou 3) :', '1');
    const poids         = Number(poidsStr);
    const quantiteTot   = Number(quantiteStr);
    const numComptage   = Number(numCompStr);
    if ([poids, quantiteTot, numComptage].some(isNaN)) {
      return alert('Valeurs numériques invalides');
    }

    const nouveau: Comptage = {
      id: undefined,
      operateurId: this.currentOperatorId,
      emplacement,
      reference,
      numLot,
      numSousLot,
      typeMatiere,
      poids,
      quantiteTotale: quantiteTot,
      numComptage
    };

    this.operatorService.addComptage(nouveau).subscribe({
      next: ()   => this.loadComptages(),
      error: err => console.error('Erreur ajout', err)
    });
  }

  editComptage(c: Comptage): void {
    console.log('editComptage appelé pour', c);
    // — on pré‑remplit tous les champs pour édition
    const emplacement = prompt('Emplacement :', c.emplacement);
    if (emplacement === null) return;
    const reference   = prompt('Référence :', c.reference);
    if (reference === null) return;
    const numLot      = prompt('Numéro de lot :', c.numLot);
    if (numLot === null) return;
    const numSousLot  = prompt('Numéro de sous‑lot :', c.numSousLot);
    if (numSousLot === null) return;
    const typeMatiere = prompt('Type de matière :', c.typeMatiere);
    if (typeMatiere === null) return;
    const poidsStr    = prompt('Poids (g) :', c.poids.toString());
    const quantiteStr = prompt('Quantité totale :', c.quantiteTotale.toString());
    const numCompStr  = prompt('Numéro de comptage :', c.numComptage.toString());
    const poids       = Number(poidsStr);
    const quantiteTot = Number(quantiteStr);
    const numComptage = Number(numCompStr);
    if ([poids, quantiteTot, numComptage].some(isNaN)) {
      return alert('Valeurs numériques invalides');
    }

    const updated: Comptage = {
      ...c,
      emplacement,
      reference,
      numLot,
      numSousLot,
      typeMatiere,
      poids,
      quantiteTotale: quantiteTot,
      numComptage
    };

    this.operatorService
      .editComptage(this.currentOperatorId, updated)
      .subscribe({
        next: ()   => this.loadComptages(),
        error: err => console.error('Erreur modif', err)
      });
  }

  deleteComptage(comptageId: number): void {
    if (!confirm('Supprimer ce comptage ?')) return;
    this.operatorService
      .deleteComptage(this.currentOperatorId, comptageId)
      .subscribe({
        next: ()   => this.loadComptages(),
        error: err => console.error('Erreur suppression', err)
      });
  }
}

/**import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { OperatorService }   from '../../services/operator.service';
import { Comptage }          from '../../models/comptage.model';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
  comptages: Comptage[] = [];
  currentOperatorId = 1; // TODO: récupérer dynamiquement depuis AuthService

  constructor(private operatorService: OperatorService) {}

  ngOnInit(): void {
    this.loadComptages();
  }

  loadComptages(): void {
    this.operatorService.getComptages(this.currentOperatorId).subscribe({
      next: data => this.comptages = data,
      error: err  => console.error('Erreur chargement', err)
    });
  }

  addComptage(): void {
    const nouveau: Comptage = {
      id: undefined,
      operateurId: this.currentOperatorId,
      emplacement: 'Zone A',
      reference: 'REF123',
      numLot: 'LOT01',
      numSousLot: 'SL01',
      typeMatiere: 'TypeX',
      poids: 150,
      quantiteTotale: 500,
      numComptage: 1
    };
    this.operatorService.addComptage(nouveau).subscribe({
      next: created => this.comptages.push(created),
      error: err     => console.error('Erreur ajout', err)
    });
  }

  editComptage(c: Comptage): void {
    const saisie = prompt('Nouveau poids', c.poids.toString());
    const newPoids = saisie !== null ? Number(saisie) : NaN;
    if (isNaN(newPoids)) return;
    const updated = { ...c, poids: newPoids };
    this.operatorService.editComptage( updated).subscribe({
      next: ()   => this.loadComptages(),
      error: err => console.error('Erreur modif', err)
    });
  }

  deleteComptage(id: number): void {
    if (!confirm('Supprimer ce comptage ?')) return;
    this.operatorService.resetComptage(id).subscribe({
      next: ()   => this.loadComptages(),
      error: err => console.error('Erreur reset', err)
    });
  }}*/