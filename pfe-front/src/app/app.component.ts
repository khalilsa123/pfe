import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { delay, filter, map, tap } from 'rxjs/operators';
import { ColorModeService } from '@coreui/angular';
import { IconSetService } from '@coreui/icons-angular';


@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  // Titre par défaut de l'application
  title = 'CoreUI Angular Admin Template';

  // Injections via l'API d'injection moderne
  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #titleService = inject(Title);
  readonly #colorModeService = inject(ColorModeService);
  readonly #iconSetService = inject(IconSetService);

  constructor() {
    // Définir le titre de l'application au démarrage
    this.#titleService.setTitle(this.title);
    // Configurer l'ensemble des icônes
  

  }

  ngOnInit(): void {
    // Mise à jour dynamique du titre en fonction de la route activée
    this.#router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        // Parcours des routes enfants pour récupérer le titre
        let child = this.#activatedRoute.firstChild;
        while(child && child.firstChild) {
          child = child.firstChild;
        }
        return child?.snapshot.data['title'] || this.title;
      }),
      tap(dynamicTitle => {
        this.#titleService.setTitle(dynamicTitle);  // Mise à jour du titre du navigateur
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();

    // Traitement pour changer la thématique en fonction des query params
    this.#activatedRoute.queryParams.pipe(
      delay(1),
      map(params => <string>params['theme']?.match(/^[A-Za-z0-9\s]+/)?.[0]),
      filter(theme => ['dark', 'light', 'auto'].includes(theme)),
      tap(theme => {
        this.#colorModeService.colorMode.set(theme);
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();
  }
}
