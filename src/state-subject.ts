import { isEqual } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export class StateSubject<T> extends BehaviorSubject<T> {
    private initialValue: T

    constructor(value: T) {
        super(value)
        this.initialValue = value
    }

    get value$(): Observable<T> {
        return super.asObservable().pipe(distinctUntilChanged((a, b) => isEqual(a, b)))
    }

    update(value: T): void {
        this.next(value)
    }

    reset(): void {
        this.next(this.initialValue)
    }
}
