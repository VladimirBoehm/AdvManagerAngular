import { effect, inject } from '@angular/core';
import { NgRxTestEntity } from '../../_models/ngRxTestEntity';
import {
  addEntities,
  entityConfig,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';

import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { NgRxTestEntityService } from './ngRxTestEntity.service';

import { lastValueFrom } from 'rxjs';

type appState = {};

// AppState
const initialState: appState = {};

export function withLogger(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          const state = getState(store);
          console.log(`${name} state changed:`, state);
        });
      },
    })
  );
}

const todoConfig = entityConfig({
  entity: type<NgRxTestEntity>(),
  collection: 'ngRxTest',
});

// addEntities, updateEntities etc.:
// https://ngrx.io/guide/signals/signal-store/entity-management
export const ngRxTestEntityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities(todoConfig),
  withLogger('appState'),
  withMethods(
    (store, ngRxTestEntityService = inject(NgRxTestEntityService)) => ({
      async loadAll(): Promise<void> {
        try {
          const test = await ngRxTestEntityService.getAll();
          const response = await lastValueFrom(test);
          patchState(store, addEntities(response, todoConfig));
        } catch (error) {
          console.error('Error loading entities', error);
        }
      },
      async updateEntity(entity: NgRxTestEntity): Promise<void> {
        try {
          console.log(entity);
          patchState(
            store,
            updateEntity(
              { id: entity.id, changes: () => ({ value: entity.value }) },
              todoConfig
            )
          );
        } catch (error) {
          console.error('Error updating entity', error);
        }
      },
    })
  )
);
/*

export const BooksStore = signalStore(
  withState(initialState),

  withMethods((store, booksService = inject(BooksService)) => ({
    // 👇 Defining a method to load books by query.
    loadByQuery: rxMethod<string>( ---------------------------------------------------- RxJs Loading
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => patchState(store, { isLoading: true })),
        switchMap((query) => {
          return booksService.getByQuery(query).pipe(
            tapResponse({
              next: (books) => patchState(store, { books, isLoading: false }),
              error: (err) => {
                patchState(store, { isLoading: false });
                console.error(err);
              },
            })
          );
        })
      )
    ),
  }))




export const BooksStore = signalStore(
  withState(initialState),
  // 👇 Accessing previously defined state signals and properties.
  withComputed(({ books, filter }) => ({
    booksCount: computed(() => books().length),    -------------------------------------// Зависимые свойства
    sortedBooks: computed(() => {
      const direction = filter.order() === 'asc' ? 1 : -1;

      return books().toSorted((a, b) =>
        direction * a.title.localeCompare(b.title)
      );
    }),
  }))
);
*/

/*
export const BooksStore = signalStore(
  withState(initialState),
  // 👇 Accessing a store instance with previously defined state signals,
  // properties, and methods.
  withMethods((store) => ({ ------------------------------------------------------------------------------------------------------ методы
    updateQuery(query: string): void {
      // 👇 Updating state using the `patchState` function.
      patchState(store, (state) => ({ filter: { ...state.filter, query } }));
    },
    updateOrder(order: 'asc' | 'desc'): void {
      patchState(store, (state) => ({ filter: { ...state.filter, order } }));
    },
  }))
);



export const BooksStore = signalStore(
  withState<BooksState>({ books: [], isLoading: false }),
  withProps(() => ({-----------------------------------------------------------> INJECTIONS !
    booksService: inject(BooksService), --------------------------------------->
    logger: inject(Logger),
  })),
  withMethods(({ booksService, logger, ...store }) => ({
    async loadBooks(): Promise<void> {
      logger.debug('Loading books...');
      patchState(store, { isLoading: true });
      
      const books = await booksService.getAll();
      logger.debug('Books loaded successfully', books);
      
      patchState(store, { books, isLoading: false });
    },
  })),
  withHooks({
    onInit({ logger }) {
      logger.debug('BooksStore initialized');
    },
  }),
);







export const CounterStore = signalStore(
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, { count: store.count() + 1 });
    },
  })),
  withHooks({
    onInit(store) {
      -----------------------------------In the example above, the watchState function will execute the provided watcher 3 times: once with the initial counter state value and two times after each increment. Conversely,
      ----------------------------------------------------- the effect function will be executed only once with the final counter state value.
      watchState(store, (state) => { --------------------------------------------------------- пересчитывается при изменении store
      console.log('[watchState] counter state', state);
      }); // logs: { count: 0 }, { count: 1 }, { count: 2 }
      
      effect(() => { --------------------------------------------------------- пересчитывается при изменении store !
        console.log('[effect] counter state', getState(store));
      }); // logs: { count: 2 }

      store.increment();
      store.increment();
    },
  })
);


------------watchState--------------- also possible: 
  ngOnInit(): void {
    watchState(this.store, console.log, {
      injector: this.#injector,
    });----------




------------------------
export function setPending(): RequestStatusState {
  return { requestStatus: 'pending' };
}

export const BooksStore = signalStore(
  withEntities<Book>(),
  withRequestStatus(),
  withMethods((store, booksService = inject(BooksService)) => ({
    async loadAll() {
      patchState(store, setPending());

      const books = await booksService.getAll();
      patchState(store, setAllEntities(books), setFulfilled());
    },
  })),
)
---------------------Custom store feature with input-------------------------
export type SelectedEntityState = { selectedEntityId: EntityId | null };

export function withSelectedEntity<Entity>() {
  return signalStoreFeature(
    { state: type<EntityState<Entity>>() },
    withState<SelectedEntityState>({ selectedEntityId: null }),
    withComputed(({ entityMap, selectedEntityId }) => ({
      selectedEntity: computed(() => {
        const selectedId = selectedEntityId();
        return selectedId ? entityMap()[selectedId] : null;
      }),
    }))
  );
}

export const BooksStore = signalStore(
  withEntities<Book>(),
  withSelectedEntity()
);
^^^
** State signals from withSelectedEntity feature:
selectedEntityId: Signal<EntityId | null>
Computed signals from withSelectedEntity feature:
selectedEntity: Signal<Book | null>


-------------------------- WithEntities-----------





*/
