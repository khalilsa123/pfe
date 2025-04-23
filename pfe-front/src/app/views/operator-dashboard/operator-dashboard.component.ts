// src/app/views/pages/operator-dashboard/operator-dashboard.component.ts
import { Component, OnInit }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from '@angular/forms';
import { OperatorService }              from '../../services/operator.service';
import { AuthentificationnServiceService } from '../../services/authentificationn.service';
import { Comptage }                     from '../../models/comptage.model';
import { User }                         from '../../models/user.model';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
  user: User | null              = null;
  showProfile                    = false;
  comptages: Comptage[]          = [];
  newComptage: Partial<Comptage> = {};
  editing                        = false;

  constructor(
    private authSrv: AuthentificationnServiceService,
    private opSrv:   OperatorService
  ) {}

  ngOnInit(): void {
    this.user = this.authSrv.getCurrentUser();
    if (!this.user) {
      window.location.href = '/login';
      return;
    }
    this.loadComptages();
  }

  logout(): void {
    this.authSrv.logout();
    window.location.href = '/login';
  }

  private loadComptages(): void {
    if (!this.user) return;
    this.opSrv.getComptages(this.user.id!).subscribe({
      next: data => {
        this.comptages = data.sort((a,b) =>
          new Date(b.timestamp!).getTime()
          - new Date(a.timestamp!).getTime()
        );
      },
      error: err => console.error('Erreur chargement', err)
    });
  }

  scanQr(): void {
    const scan = prompt('Collez le code QR (ref$lot$sousLot$qtTotale)');
    if (!scan) return;
    const [ref, lot, sl, qt] = scan.split('$');
    this.newComptage = {
      reference:      ref,
      numLot:         lot,
      numSousLot:     sl,
      quantiteTotale: Math.max(0, Number(qt)),
      emplacement:    '',
      typeMatiere:    '',
      poids:          0,
      numComptage:    1
    };
    this.editing = false;
  }

  onSubmit(): void {
    if (!this.user) return;
    const now = new Date().toISOString();
    const payload: Comptage = {
      id:             this.editing ? this.newComptage.id : undefined,
      operateurId:    this.user.id!,
      reference:      this.newComptage.reference!,
      numLot:         this.newComptage.numLot!,
      numSousLot:     this.newComptage.numSousLot!,
      quantiteTotale: this.newComptage.quantiteTotale!,
      emplacement:    this.newComptage.emplacement || '',
      typeMatiere:    this.newComptage.typeMatiere || '',
      poids:          this.newComptage.poids!,
      numComptage:    this.newComptage.numComptage!,
      timestamp:      now
    };
    const obs = this.editing
      ? this.opSrv.editComptage(this.user.id!, payload)
      : this.opSrv.addComptage(this.user.id!, payload);
    obs.subscribe({
      next: () => { this.loadComptages(); this.resetForm(); },
      error: err => console.error(this.editing ? 'Erreur modif' : 'Erreur ajout', err)
    });
  }

  editComptage(c: Comptage): void {
    this.newComptage = { ...c };
    this.editing = true;
  }

  delete(c: Comptage): void {
    if (!this.user || !confirm('Supprimer ce comptage ?')) return;
    this.opSrv.deleteComptage(this.user.id!, c.id!).subscribe({
      next: () => this.loadComptages(),
      error: err => console.error('Erreur suppression', err)
    });
  }

  private resetForm(): void {
    this.newComptage = {};
    this.editing = false;
  }
}
