import { Component, OnInit , ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

import { OperatorService } from '../../services/operator.service';
import { ComptageService } from '../../services/comptage.service';
import { AuthentificationnServiceService } from '../../services/authentificationn.service';
import { Comptage } from '../../models/comptage.model';
import { User } from '../../models/user.model';
import { PaginationComponent }        from '../../../components/pagination/pagination.component';


// Interface for SessionInventaire
interface SessionInventaire {
  id?: number;
  nomSession: string;
  dateDebut: string;
  dateFin: string;
  commentaire?: string;
  comptages?: Comptage[];
}

// Interface étendue pour les comptages avec info opérateur
interface ComptageWithOperator extends Comptage {
  operatorId?: string;
  operatorName?: string;
}

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    PaginationComponent, 
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule
  ],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
   @ViewChild('sessionComptagesTable', { read: ElementRef }) sessionComptagesTable?: ElementRef;
  sessionSearchTerm = '';
  sessionSortAscending = false;
  currentPage = 1;
  itemsPerPage = 15;
  paginatedComptages: ComptageWithOperator[] = [];
  paginatedSessionComptages: ComptageWithOperator[] = [];
  paginatedUsers: User[] = [];
  sessionComptagesCurrentPage = 1;
  usersCurrentPage = 1;
  user?: User;
  showProfile = false;
  showUsersMenu = false;
  originalReference?: string;
  showInventoryManagement = false;
  showSessionInventaire = false;
  showCreateSessionForm = false;
  showCountingDropdown = false;
  showAllCounting = false;
  showCountingType1 = false;
  showCountingType2 = false;
  showCountingType3 = false;
  assignedCount = 0;
  sortAscending = false;
  activeButton: 'inventory' | 'session-inventaire' | 'counting' | 'users' | 'results' | null = null;
  currentUsersRole?: 'OPERATEUR' | 'SUPERVISEUR';
  users: User[] = [];
  comptages: Comptage[] = [];
  userComptages: ComptageWithOperator[] = []; // Updated to use ComptageWithOperator
  allComptages: ComptageWithOperator[] = [];
  filteredComptages: ComptageWithOperator[] = [];
  sessions: SessionInventaire[] = [];
  newSession: Partial<SessionInventaire> = {};
  selectedSession: SessionInventaire | null = null;
  sessionComptages: ComptageWithOperator[] = [];
  newComptage: Partial<Comptage> = {};
  editing = false;
  selectedUserId: number | null = null;

  private apiUrl = 'http://localhost:8080/api/session-inventaire';

  constructor(
    private authSrv: AuthentificationnServiceService,
    private opSrv: OperatorService,
    private comptageService: ComptageService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.btn-group')) {
        this.selectedUserId = null;
      }
      if (!target.closest('.user-profile-container') && this.showProfile) {
        this.showProfile = false;
      }
    });
  }

  ngOnInit(): void {
  this.user = this.authSrv.getCurrentUser() || undefined;
  if (!this.user) {
    this.router.navigate(['/login']);
    return;
  }

  if (this.user.role === 'OPERATEUR') {
    // Load assigned count
    this.comptageService
      .getComptageCountForOperateur(this.user.id!)
      .subscribe(cnt => this.assignedCount = cnt);
    
    // Use operator's default counting type
    if (this.user.defaultComptageType) {
      this.newComptage.numComptage = this.user.defaultComptageType;
    }
  }

  // IMPORTANT: Load all comptages at startup
  this.loadAllComptages();

  // Check route params to determine initial view
  this.route.queryParams.subscribe(params => {
    if (params['view'] === 'session-inventaire') {
      this.toggleSessionInventaire();
    } else if (params['view'] === 'counting') {
      this.toggleCountingDropdown();
      const type = params['type'];
      if (type) {
        this.showCountingList(type);
      }
    } else if (params['view'] === 'users') {
      const role = params['role'];
      if (role) {
        this.loadUsers(role);
      }
    } else {
      // Default view - show inventory management by default
      this.showInventoryManagement = true;
      this.activeButton = 'inventory';
    }
  });
}
  

  loadAllComptages() {
    this.comptageService.getAllComptages().subscribe({
      next: (data) => {
        console.log('Comptages chargés:', data.length);
        this.allComptages = data.map(c => ({
          ...c,
          operatorId: String(c.operateurId),
          operatorName: `Opérateur #${c.operateurId || 'inconnu'}`
        }));
        this.filteredComptages = [...this.allComptages];
        this.applySort();
        this.updatePagination();
      },
      error: (err) => {
        console.error('Erreur chargement comptages:', err);
      }
    });
  }

  getUserInitials(): string {
    if (!this.user) return '';
    return (
      (this.user.firstname?.charAt(0) || '') +
      (this.user.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  parseReference(fullReference: string): { ref: string; qte: string; lot: string; sousLot: string } {
    if (!fullReference) {
      return { ref: '', qte: '', lot: '', sousLot: '' };
    }
    const parts = fullReference.split(/[$#]/);
    return {
      ref: parts[0] || '',
      qte: parts[1] || '0',
      lot: parts.length > 2 ? parts[2] : '000',
      sousLot: parts.length > 3 ? parts[3] : '001'
    };
  }

  getComptageTypeName(numComptage: number): string {
    switch (numComptage) {
      case 1: return 'Premier Comptage';
      case 2: return 'Deuxième Comptage';
      case 3: return 'Troisième Comptage';
      default: return `Comptage ${numComptage}`;
    }
  }

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.applySort();
  }

  private applySort(): void {
  this.filteredComptages.sort((a, b) => {
    const dateA = new Date(a.timestamp!).getTime();
    const dateB = new Date(b.timestamp!).getTime();
    return this.sortAscending ? dateA - dateB : dateB - dateA;
  });
  this.currentPage = 1;  // Return to first page when sorting
  this.updatePagination();
}

updatePagination(): void {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedComptages = this.filteredComptages.slice(startIndex, endIndex);
}

onPageChange(page: number): void {
  this.currentPage = page;
  this.updatePagination();
}

updateSessionComptagesPagination(): void {
  const startIndex = (this.sessionComptagesCurrentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedSessionComptages = this.sessionComptages.slice(startIndex, endIndex);
}

onSessionComptagesPageChange(page: number): void {
  this.sessionComptagesCurrentPage = page;
  this.updateSessionComptagesPagination();
}

updateUsersPagination(): void {
  const startIndex = (this.usersCurrentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedUsers = this.users.slice(startIndex, endIndex);
}

onUsersPageChange(page: number): void {
  this.usersCurrentPage = page;
  this.updateUsersPagination();
}
  validateAndFormatReference(reference: string): string {
    const parts = reference.split(/[$#]/);
    const ref = parts[0] || '';
    const qte = parts[1] || '';
    let lot = parts[2] || '';
    let sousLot = parts[3] || '';

    if (!lot && !sousLot) {
      lot = '0.003';
      sousLot = '0.003';
    } else if (!lot) {
      lot = '0.001';
    } else if (!sousLot) {
      sousLot = '0.002';
    }

    return `${ref}$${qte}$${lot}#${sousLot}`;
  }

  toggleCountingDropdown(): void {
    if (this.activeButton === 'counting' && this.showCountingDropdown) {
      this.showCountingDropdown = false;
      this.closeAllCountingPanels();
      this.activeButton = null;
    } else {
      this.showCountingDropdown = true;
      this.hideAllPanels('counting');
      this.activeButton = 'counting';
    }
  }

  private closeAllCountingPanels(): void {
    this.showAllCounting = false;
    this.showCountingType1 = false;
    this.showCountingType2 = false;
    this.showCountingType3 = false;
  }

  toggleInventoryManagement(): void {
    if (this.activeButton === 'inventory') {
      this.showInventoryManagement = false;
      this.activeButton = null;
    } else {
      this.showInventoryManagement = true;
      this.hideAllPanels('inventory');
      this.activeButton = 'inventory';
      this.loadComptages();
    }
  }

  toggleSessionInventaire(): void {
    if (this.activeButton === 'session-inventaire') {
      this.showSessionInventaire = false;
      this.showCreateSessionForm = false;
      this.selectedSession = null;
      this.sessionComptages = [];
      this.activeButton = null;
    } else {
      this.showSessionInventaire = true;
      this.hideAllPanels('session-inventaire');
      this.activeButton = 'session-inventaire';
      this.loadSessions();
    }
  }

  toggleCreateSessionForm(): void {
    this.showCreateSessionForm = !this.showCreateSessionForm;
    if (!this.showCreateSessionForm) {
      this.newSession = {};
    }
  }

  private loadSessions(): void {
    this.http.get<SessionInventaire[]>(this.apiUrl).subscribe({
      next: data => {
        this.sessions = data;
      },
      error: err => {
        console.error('Erreur chargement sessions', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  createSession(): void {
    if (!this.newSession.nomSession || !this.newSession.dateDebut || !this.newSession.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.http.post<SessionInventaire>(this.apiUrl, this.newSession).subscribe({
      next: (session) => {
        this.sessions.push(session);
        this.newSession = {};
        this.showCreateSessionForm = false;
      },
      error: (err) => {
        console.error('Erreur création session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
        alert('Erreur lors de la création de la session');
      }
    });
  }

  viewSessionComptages(session: SessionInventaire): void {
  this.selectedSession = session;
  this.sessionComptages = [];
  this.sessionComptagesCurrentPage = 1;

  // Récupérer d'abord la liste des opérateurs
  this.authSrv.getUsersByRole('OPERATEUR').subscribe({
    next: operateurs => {
      const opMap = new Map<number, User>();
      operateurs.forEach(u => { if (u.id != null) opMap.set(u.id, u); });

      // Puis récupérer tous les comptages
      this.comptageService.getAllComptages().subscribe({
        next: allComptages => {
          const startTs = new Date(session.dateDebut).getTime();
          const endTs   = new Date(session.dateFin).getTime();

          this.sessionComptages = allComptages
            .filter(c => {
              const ts = new Date(c.timestamp!).getTime();
              return ts >= startTs && ts <= endTs;
            })
            .map(c => {
              const comp: ComptageWithOperator = { ...c };
              if (c.operateurId != null && opMap.has(c.operateurId)) {
                const u = opMap.get(c.operateurId)!;
                comp.operatorName = `${u.firstname} ${u.lastname}`;
              } else if (c.operateurId != null) {
                comp.operatorName = `Opérateur #${c.operateurId}`;
              } else {
                comp.operatorName = 'Inconnu';
              }
              return comp;
            });
            
          this.updateSessionComptagesPagination();
          
          // Scroll to table after data is loaded
          setTimeout(() => {
            if (this.sessionComptagesTable) {
              this.sessionComptagesTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        },
        error: err => console.error('Erreur chargement de tous les comptages :', err)
      });
    },
    error: err => console.error('Erreur chargement opérateurs :', err)
  });
}

  populateSession(sessionId: number | undefined): void {
    if (!sessionId) return;
    this.http.post<SessionInventaire>(`${this.apiUrl}/${sessionId}/populate`, {}).subscribe({
      next: (session) => {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
          this.sessions[index] = session;
        }
      },
      error: (err) => {
        console.error('Erreur peuplement session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
        alert('Erreur lors du peuplement de la session');
      }
    });
  }

  deleteSession(sessionId: number | undefined): void {
    if (!sessionId || !confirm('Supprimer cette session ?')) return;
    this.http.delete(`${this.apiUrl}/${sessionId}`).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        if (this.selectedSession?.id === sessionId) {
          this.selectedSession = null;
          this.sessionComptages = [];
        }
      },
      error: (err) => {
        console.error('Erreur suppression session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
        alert('Erreur lors de la suppression de la session');
      }
    });
  }

 showCountingList(type: 'all' | 1 | 2 | 3): void {
  this.hideAllPanels('counting');
  this.closeAllCountingPanels();
  
  if (type === 'all') {
    this.showAllCounting = true;
  } else if (type === 1) {
    this.showCountingType1 = true;
  } else if (type === 2) {
    this.showCountingType2 = true;
  } else if (type === 3) {
    this.showCountingType3 = true;
  }
  
  this.activeButton = 'counting';
  this.showCountingDropdown = true;
  this.loadComptagesByType(type);
}

  getCountingListTitle(): string {
    if (this.showAllCounting) return 'Liste de tous les comptages';
    if (this.showCountingType1) return 'Liste des premiers comptages';
    if (this.showCountingType2) return 'Liste des deuxièmes comptages';
    if (this.showCountingType3) return 'Liste des troisièmes comptages';
    return '';
  }

  private hideAllPanels(exceptPanel: 'inventory' | 'session-inventaire' | 'counting' | 'users' | 'results'): void {
    if (exceptPanel !== 'inventory') this.showInventoryManagement = false;
    if (exceptPanel !== 'session-inventaire') {
      this.showSessionInventaire = false;
      this.showCreateSessionForm = false;
      this.selectedSession = null;
      this.sessionComptages = [];
    }
    if (exceptPanel !== 'counting') {
      this.closeAllCountingPanels();
    }
    if (exceptPanel !== 'users') this.showUsersMenu = false;
  }

  loadUsers(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
  if (this.activeButton === 'users' && this.currentUsersRole === role) {
    this.showUsersMenu = false;
    this.activeButton = null;
    return;
  }
  
  this.currentUsersRole = role;
  this.hideAllPanels('users');
  this.showUsersMenu = true;
  this.activeButton = 'users';
  this.usersCurrentPage = 1;
  
  this.authSrv.getUsersByRole(role).subscribe({
    next: list => {
      this.users = list;
      this.updateUsersPagination();
    },
    error: (err: any) => {
      console.error('Erreur chargement utilisateurs', err);
      if (err.status === 401) {
        this.authSrv.logout();
        this.router.navigate(['/login']);
      }
    }
  });
}

  goToRegister(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
    this.router.navigate(['/register'], { queryParams: { role } });
  }

  canChangePassword(u: User): boolean {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  changePassword(u: User): void {
    const pwd = prompt(`Nouveau mot de passe pour ${u.username}`, '');
    if (!pwd) return;
    this.authSrv.updatePassword(u.id!, { password: pwd }).subscribe({
      error: (err: any) => {
        console.error('Erreur mise à jour pwd', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  canDeleteUser(u: User): boolean {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  deleteUser(u: User): void {
    if (!confirm(`Supprimer ${u.username} ?`)) return;
    this.authSrv.deleteUser(u.id!).subscribe({
      next: () => this.loadUsers(this.currentUsersRole!),
      error: (err: any) => {
        console.error('Erreur suppression utilisateur', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.authSrv.logout();
    this.router.navigate(['/login']);
  }

  private loadComptages(): void {
  this.comptageService.getAllComptages().subscribe({
    next: (all) => {
      // 1. Keep only the current user’s comptages
      const userComptages: ComptageWithOperator[] = all
        .filter(c => c.operateurId === this.user!.id)
        .map(c => ({
          ...c,
          operatorId: String(c.operateurId),
          // ensure operatorName is the user’s real name
          operatorName: `${this.user!.firstname} ${this.user!.lastname}`
        }));

      // 2. Sort & paginate
      this.filteredComptages = userComptages.sort((a, b) =>
        this.sortAscending
          ? new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
          : new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
      );
      this.currentPage = 1;
      this.updatePagination();
    },
    error: err => {
      console.error('Erreur chargement comptages:', err);
      if (err.status === 401) {
        this.authSrv.logout();
        this.router.navigate(['/login']);
      }
    }
  });
}


  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.showProfile = !this.showProfile;
  }

  private loadOperateurNames(comptages: Comptage[]): void {
    this.authSrv.getUsersByRole('OPERATEUR').subscribe({
      next: (operateurs: User[]) => {
        const operateursMap = new Map<number, User>();
        operateurs.forEach(op => {
          if (op.id)  {
            operateursMap.set(op.id, op);
          }
        });

        this.allComptages = comptages.map(c => {
          const comptageWithOp: ComptageWithOperator = { ...c };
          if (c.operateurId) {
            const operateur = operateursMap.get(c.operateurId);
            comptageWithOp.operatorId = c.operateurId.toString();
            comptageWithOp.operatorName = operateur
              ? `${operateur.firstname} ${operateur.lastname}`
              : `Opérateur #${c.operateurId}`;
          } else {
            comptageWithOp.operatorName = 'Inconnu';
          }
          return comptageWithOp;
        });

        this.allComptages.sort((a, b) =>
          +new Date(b.timestamp!) - +new Date(a.timestamp!)
        );
        this.applyComptageFilter();
      },
      error: (err: any) => {
        console.error('Erreur chargement opérateurs', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }
  private applyComptageFilter(): void {
    if (this.showAllCounting) {
      this.filteredComptages = [...this.allComptages];
    } else if (this.showCountingType1) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 1);
    } else if (this.showCountingType2) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 2);
    } else if (this.showCountingType3) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 3);
    }
    this.currentPage = 1; // Reset to first page when filtering
    this.applySort(); // This will also call updatePagination
  }

  goToResultsPage(): void {
    this.activeButton = 'results';
    this.hideAllPanels('results');
    this.router.navigate(['/resultats-comptage']);
  }

  private loadComptagesByType(type: 'all' | 1 | 2 | 3): void {
    const isAdmin = this.user?.role === 'ADMIN';
    const isSupervisor = this.user?.role === 'SUPERVISEUR';

    if (isAdmin || isSupervisor) {
      if (type === 'all') {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => this.loadOperateurNames(data),
          error: (err: any) => {
            console.error('Erreur chargement comptages', err);
            if (err.status === 401) {
              this.authSrv.logout();
              this.router.navigate(['/login']);
            }
          }
        });
      } else {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => {
            const filteredData = data.filter(c => c.numComptage === type);
            this.loadOperateurNames(filteredData);
          },
          error: (err: any) => {
            console.error('Erreur chargement comptages', err);
            if (err.status === 401) {
              this.authSrv.logout();
              this.router.navigate(['/login']);
            }
          }
        });
      }
    } else {
      this.comptageService.getAllComptages().subscribe({
        next: (data: Comptage[]) => {
          const userComptages = data.filter(c => c.operateurId === this.user?.id);
          const comptagesWithOperator: ComptageWithOperator[] = userComptages.map(c => ({
            ...c,
            operatorId: this.user?.id?.toString(),
            operatorName: `${this.user?.firstname} ${this.user?.lastname}`
          }));

          comptagesWithOperator.sort((a, b) =>
            +new Date(b.timestamp!) - +new Date(a.timestamp!)
          );

          this.allComptages = comptagesWithOperator;

          if (type === 'all') {
            this.filteredComptages = [...this.allComptages];
          } else {
            this.filteredComptages = this.allComptages.filter(c => c.numComptage === type);
          }

          this.applySort();
        },
        error: (err: any) => {
          console.error('Erreur chargement comptages', err);
          if (err.status === 401) {
            this.authSrv.logout();
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  onSubmit(): void {
    console.log('Préparation du comptage:', this.newComptage);

    if (this.newComptage.reference) {
      this.newComptage.reference = this.validateAndFormatReference(this.newComptage.reference);
    }

    if (!this.newComptage.reference) {
      alert('La référence est obligatoire');
      return;
    }

    if (this.newComptage.poids === undefined || this.newComptage.poids <= 0) {
      alert('Le poids est obligatoire et doit être supérieur à 0');
      return;
    }

    const referenceParts = this.parseReference(this.newComptage.reference);
    if (!referenceParts.ref || !referenceParts.qte) {
      alert('La référence doit être au format ref$qte$lot$sous_lot');
      return;
    }

    const comptage: Comptage = {
      reference: this.newComptage.reference,
      quantiteTotale: parseInt(referenceParts.qte) || 0,
      numLot: referenceParts.lot,
      numSousLot: referenceParts.sousLot,
      poids: Number(this.newComptage.poids),
      numComptage: Number(this.newComptage.numComptage) || 1,
      emplacement: this.newComptage.emplacement || '',
      operateurId: this.user!.id!,
      timestamp: new Date().toISOString(),
      iteration: 1
    };

    console.log('Envoi du comptage:', comptage);
    if (this.editing && this.newComptage.id) {
      this.comptageService.updateComptage(this.newComptage.id, comptage).subscribe({
        next: () => {
          this.editing = false;
          this.newComptage = { numComptage: this.user?.defaultComptageType || 1 };
          this.loadComptages();
        },
        error: (err: any) => {
          console.error('Erreur mise à jour', err);
          alert('Erreur lors de la mise à jour du comptage: ' + (err.message || 'Erreur inconnue'));
        }
      });
    } else {
      this.comptageService.addComptage(this.user!.id!, comptage).subscribe({
        next: () => {
          this.newComptage = { numComptage: this.user?.defaultComptageType || 1 };
          this.loadComptages();
        },
        error: (err: any) => {
          console.error('Erreur création', err);
          alert('Erreur lors de l\'ajout du comptage: ' + (err.message || 'Erreur inconnue'));
        }
      });
    }
  }

  editComptage(c: Comptage): void {
    this.editing = true;
    this.originalReference = c.reference;
    this.newComptage = { ...c };
  }

  delete(c: Comptage): void {
    if (!c.id) return;
    if (!confirm('Supprimer ce comptage ?')) return;
    this.comptageService.deleteComptage(this.user!.id!, c.id!).subscribe({
      next: () => {
        this.loadComptages();
      },
      error: (err: any) => {
        console.error('Erreur suppression', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['//login']);
        }
      }
    });
  }

  toggleComptageDropdown(userId: number): void {
    if (this.selectedUserId === userId) {
      this.selectedUserId = null;
    } else {
      this.selectedUserId = userId;
    }
  }

  assignComptageType(user: User, comptageType: number | null): void {
  if (!user.id) return;
  
  this.authSrv.updateUserDefaultComptageType(user.id, comptageType || 0).subscribe({
      next: () => {
      // Update user in local list
      user.defaultComptageType = comptageType || undefined;
      this.selectedUserId = null; // Close the dropdown
      this.snackBar.open(
        `Type de comptage ${comptageType || 'aucun'} affecté à ${user.firstname} ${user.lastname}`,
        'Fermer',
        { duration: 3000 }
      );
    },
    error: (err) => {
      console.error('Erreur lors de l\'affectation du type de comptage:', err);
      if (err.status === 401) {
        this.authSrv.logout();
        this.router.navigate(['/login']);
      } else {
        this.snackBar.open(
          'Erreur lors de l\'affectation du type de comptage',
          'Fermer',
          { duration: 3000 }
        );
      }
    }
  });
}

  toggleSessionSortOrder(): void {
    this.sessionSortAscending = !this.sessionSortAscending;
    this.sortSessionComptages();
  }

  sortSessionComptages(): void {
    this.sessionComptages.sort((a, b) => {
      const dateA = new Date(a.timestamp!).getTime();
      const dateB = new Date(b.timestamp!).getTime();
      return this.sessionSortAscending ? dateA - dateB : dateB - dateA;
    });
    this.updateSessionComptagesPagination();
  }

  filterSessionComptages(): void {
    if (!this.sessionSearchTerm) {
      // Reset to original data
      this.updateSessionComptagesPagination();
      return;
    }
    
    const term = this.sessionSearchTerm.toLowerCase();
    const filtered = this.sessionComptages.filter(c => {
      const parsed = this.parseReference(c.reference);
      return parsed.ref.toLowerCase().includes(term) || 
             parsed.lot.toLowerCase().includes(term) || 
             parsed.sousLot.toLowerCase().includes(term);
    });
    
    this.paginatedSessionComptages = filtered.slice(0, this.itemsPerPage);
    this.sessionComptagesCurrentPage = 1;
  }
}