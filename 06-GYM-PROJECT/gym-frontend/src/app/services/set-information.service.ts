import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/operators';

import { ApiService } from '../core/services/api.service';
import {
  CreateSetInformationRequest,
  SetInformation,
  UpdateSetInformationRequest,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class SetInformationService extends ApiService {
  private readonly informationsSignal = signal<SetInformation[]>([]);

  readonly informations = this.informationsSignal.asReadonly();

  getBySetExecutionId(setExecutionId: string) {
    return this.get<SetInformation[]>(
      `/set-executions/${setExecutionId}/set-informations`,
    );
  }

  create(payload: CreateSetInformationRequest) {
    return this.post<SetInformation, CreateSetInformationRequest>(
      '/set-informations',
      payload,
    ).pipe(
      tap((information) => {
        this.informationsSignal.update((items) => [...items, information]);
      }),
    );
  }

  update(id: string, payload: UpdateSetInformationRequest) {
    return this.put<SetInformation, UpdateSetInformationRequest>(
      `/set-informations/${id}`,
      payload,
    ).pipe(
      tap((information) => {
        this.informationsSignal.update((items) =>
          items.map((item) => (item.id === id ? information : item)),
        );
      }),
    );
  }

  remove(id: string) {
    return this.delete<void>(`/set-informations/${id}`).pipe(
      tap(() => {
        this.informationsSignal.update((items) =>
          items.filter((item) => item.id !== id),
        );
      }),
    );
  }
}
