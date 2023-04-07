import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable, of, share, Subscription, switchMap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationService} from "../../../core/notification/notification.service";
import {TrackService} from "../../../data/track/track.service";
import {RegionService} from "../../../data/region/region.service";
import {Region} from "../../../data/region/region.domain";

@Component({
  selector: 'app-track-edit',
  templateUrl: './track-edit.component.html',
  styleUrls: ['./track-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackEditComponent implements OnInit, OnDestroy {

  protected readonly form = new FormGroup({
    id: new FormControl<string | null>(null),
    start_time: new FormControl<Date | null>(null, [Validators.required]),
    end_time: new FormControl<Date | null>(null, [Validators.required]),
    line: new FormControl<number | null>(null, [Validators.required]),
    run: new FormControl<number | null>(null, [Validators.required]),
    region: new FormControl<number | null>(null, [Validators.required]),
    owner: new FormControl<string | null>(null, [Validators.required]),
    finished: new FormControl<boolean | null>(null, [Validators.required]),
    correlated: new FormControl<boolean | null>(null, [Validators.required]),
  });

  private readonly track = this.route.params.pipe(
    switchMap(({id}) => this.trackService.get(id)),
    share()
  );

  private trackSubscription: Subscription | undefined;

  // protected readonly getRegion: GetFn = id => this.regionService.getCached(Number(id));
  //
  // protected searchRegion(): (term: string) => Observable<SearchResult> {
  //   return term => this.regionService.searchCached(term)
  //     .pipe(map(result => ({
  //       exact: result.find(d => d.name.toLowerCase().trim() === term.toLowerCase()),
  //       result,
  //     })));
  // }

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly trackService: TrackService,
    private readonly notificationService: NotificationService,
    protected readonly regionService: RegionService,
  ) {
  }

  public ngOnInit(): void {
    this.trackSubscription = this.track.subscribe(track => {
      this.form.setValue({
        id: track.id,
        correlated: track.correlated,
        end_time: new Date(track.end_time),
        finished: track.finished,
        line: track.line,
        owner: track.owner,
        region: track.region,
        run: track.run,
        start_time: new Date(track.start_time),
      });
    })
  }

  public ngOnDestroy(): void {
    this.trackSubscription?.unsubscribe();
  }

  protected save(): void {
    if (!this.form.valid) {
      return;
    }

    const track = this.form.getRawValue();
    const id = track.id;

    if (!id) {
      throw new Error("track id is null??");
    }

    this.trackService.set(id, {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      correlated: track.correlated!,
      end_time: track.end_time!.toISOString(),
      finished: track.finished!,
      gps: [],
      line: track.line!,
      owner: track.owner!,
      region: track.region!,
      run: track.run!,
      start_time: track.start_time!.toISOString(),
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    })
      .pipe(switchMap(station => this.router.navigate(['..'], {relativeTo: this.route}).then(() => station)))
      .subscribe({
        next: () => this.notificationService.success(`Track was successfully updated.`),
        error: err => {
          console.error(err);
          this.notificationService.error(`Failed to update track: ${err}`)
        }
      });
  }

  protected getCachedRegion(id: number | undefined | null): Observable<Region | undefined> {
    return id ? this.regionService.getCached(id) : of(undefined);
  }
}
