# RxJS-State-Subject

### Installation

```
npm inistall rxjs-state-subject
```

### Usage

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