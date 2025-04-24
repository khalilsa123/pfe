import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorService } from '../../services/operator.service';
import { AuthentificationnServiceService } from '../../services/authentificationn.service';
import { Comptage } from '../../models/comptage.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
  user?: User;
  showProfile = false;
  showUsersMenu = false;
  showInventoryManagement = false; // Nouveau flag pour afficher/masquer la gestion des inventaires
  currentUsersRole?: 'OPERATEUR' | 'SUPERVISEUR';
  users: User[] = [];
  comptages: Comptage[] = [];
  newComptage: Partial<Comptage> = {};
  editing = false;

  constructor(
    private authSrv: AuthentificationnServiceService,
    private opSrv: OperatorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authSrv.getCurrentUser()!;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    // Nous ne chargeons plus les comptages au démarrage car le panneau d'inventaire est caché
  }

  // -- UTILISATEURS --
  loadUsers(role: 'OPERATEUR' | 'SUPERVISEUR') {
    this.currentUsersRole = role;
    this.showUsersMenu = true;
    this.showInventoryManagement = false; // Masque la gestion d'inventaire quand on affiche les utilisateurs
    
    this.authSrv.getUsersByRole(role).subscribe({
      next: list => this.users = list,
      error: (err: any) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  goToRegister(role: 'OPERATEUR' | 'SUPERVISEUR') {
    this.router.navigate(['/register'], { queryParams: { role } });
  }

  canChangePassword(u: User) {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  changePassword(u: User) {
    const pwd = prompt(`Nouveau mot de passe pour ${u.username}`, '');
    if (!pwd) return;
    this.authSrv.updatePassword(u.id!, { password: pwd }).subscribe({
      next: () => alert('Mot de passe mis à jour'),
      error: (err: any) => console.error('Erreur mise à jour pwd', err)
    });
  }

  canDeleteUser(u: User) {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  deleteUser(u: User) {
    if (!confirm(`Supprimer ${u.username} ?`)) return;
    this.authSrv.deleteUser(u.id!).subscribe({
      next: () => this.loadUsers(this.currentUsersRole!),
      error: (err: any) => console.error('Erreur suppression utilisateur', err)
    });
  }

  logout() {
    this.authSrv.logout();
    this.router.navigate(['/login']);
  }

  // -- COMPTAGES --
  // Méthode pour activer le panneau de gestion d'inventaire
  toggleInventoryManagement() {
    this.showInventoryManagement = !this.showInventoryManagement;
    this.showUsersMenu = false; // Masque la liste des utilisateurs
    
    if (this.showInventoryManagement) {
      this.loadComptages(); // Charge les comptages seulement quand on a besoin
    }
  }
  
  private loadComptages() {
    this.opSrv.getComptages(this.user!.id!).subscribe({
      next: data => {
        this.comptages = data.sort((a, b) =>
          +new Date(b.timestamp!) - +new Date(a.timestamp!)
        );
      },
      error: (err: any) => console.error('Erreur chargement comptages', err)
    });
  }

  /** Ajout ou mise à jour */
  onSubmit(): void {
    // Si référence est fournie, on tente de remplir automatiquement les autres champs
    // Cette logique serait à personnaliser selon votre système
    if (this.newComptage.reference && !this.editing) {
      // Exemple: si la référence a un format spécifique, on extrait des informations
      // Format hypothétique: REF-LOT-SOUSLOT-QTE
      const refParts = this.newComptage.reference.split('-');
      if (refParts.length >= 4) {
        this.newComptage.numLot = refParts[1];
        this.newComptage.numSousLot = refParts[2];
        this.newComptage.quantiteTotale = parseInt(refParts[3], 10);
      } else {
        // Valeurs par défaut si le format ne correspond pas
        this.newComptage.numLot = 'Auto';
        this.newComptage.numSousLot = 'Auto';
        this.newComptage.quantiteTotale = 1;
      }
    }

    if (this.editing) {
      // UPDATE
      this.opSrv.editComptage(this.user!.id!, this.newComptage as Comptage).subscribe({
        next: () => {
          this.editing = false;
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => console.error('Erreur mise à jour', err)
      });
    } else {
      // CREATE
      this.opSrv.addComptage(this.user!.id!, this.newComptage as Comptage).subscribe({
        next: () => {
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => console.error('Erreur création', err)
      });
    }
  }

  /** Prépare l'édition */
  editComptage(c: Comptage): void {
    this.editing = true;
    this.newComptage = { ...c };
  }

  /** Suppression */
  delete(c: Comptage): void {
    if (!c.id) return;
    if (!confirm('Supprimer ce comptage ?')) return;
    this.opSrv.deleteComptage(this.user!.id!, c.id).subscribe({
      next: () => this.loadComptages(),
      error: (err: any) => console.error('Erreur suppression', err)
    });
  }
}