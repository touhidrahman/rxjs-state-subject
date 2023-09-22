# RxJS-State-Subject

### Installation

```
npm install rxjs-state-subject
```

### Usage of StateSubject

```typescript
import { StateSubject } from 'rxjs-state-subject';

// Now use it for state management, for example in an Angular Service class
@Injectable()
export class TitleStateService {
    private title = new StateSubject<string>('Hello initial title!');

    public updateTitle(title: string): void {
        this.title.update(title);
    }

    public resetTitle(): void {
        this.title.reset();
    }

    // Subscribe to title value changes to trigger side effects
    constructor() {
        this.handleEffects();
    }

    private handleEffects(): void {
        this.title.value$.subscribe(title => console.log('Title changed!'));
    }
}
```

Use more StateSubjects in your service for more complex state management.

### Usage of Store

```typescript
import { Injectable, OnDestroy } from '@angular/core'
import { ManyEntityResponse, Movie, Person } from '@core/interfaces'
import { Store } from 'rxjs-state-subject'
import { combineLatest, debounceTime, Subject, switchMap, takeUntil, tap } from 'rxjs'
import { MovieApiService } from '../services/Movie-api.service'

@Injectable()
export class MovieListStateService implements OnDestroy {
    private unsubscriber: Subject<void> = new Subject<void>()

    store = new Store<{
        loading: boolean
        movies: Movie[]
        page: number
        size: number
        year: number
        search: string
        actors: Person[]
    }>(
        {
            loading: false,
            movies: [],
            page: 1,
            size: 10,
            year: new Date().getFullYear(),
            search: '',
            actors: [],
        },
        this.unsubscriber,
    )

    constructor(private movieApi: MovieApiService) {
        this.init()
    }

    ngOnDestroy(): void {
        this.unsubscriber.next()
        this.unsubscriber.complete()
    }

    reset() {
        this.store.reset()
    }

    private init(): void {
        combineLatest({
            search: this.store.select('search'),
            page: this.store.select('page'),
            size: this.store.select('size'),
            year: this.store.select('year'),
            actors: this.store.select('actors'),
        })
        .pipe(
            debounceTime(300),
            tap(() => this.store.setState({ loading: true })),
            switchMap(({ search, page, size, year, actors }) => {
                const actorIds = actors.map((a) => a.id)
                return this.movieApi.find({ search, page, size, year, actorIds })
            }),
            takeUntil(this.unsubscriber),
        )
        .subscribe({
            next: (res) => {
                this.store.setState({ movies: res, loading: false })
            },
        })
    }
}
```

Now use the injectable state in your component:

```typescript
@Component({
    standalone: true,
    imports: [...],
    providers: [MovieListStateService],
})
export class HomePageComponent implements OnInit {
    movies: Movie[] = []

    constructor(
        public movieListState: MovieListStateService,
        private activatedRoute: ActivatedRoute,
    ) {
        const page = +this.activatedRoute.snapshot.queryParams.page
        // load first page
        this.movieListState.store.setState({ page: page ?? 1 })
    }

    ngOnInit(): void {
        this.movieListState.store.select('movies').subscribe({
            next: (movies) => {
                this.movies = movies
            }
        })
    }
}