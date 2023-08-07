import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CountriesService } from '../../services/countries.service';
import {
  Region,
  SmallCountry,
} from '../../interfaces/country.interface';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  public countriesByRegion: SmallCountry[] = [];

  public borders: SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  ngOnInit(): void {
    this.onRegionChange();

    this.onCountryChange();
  }

  public onRegionChange(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('country')?.setValue('')),
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region)
        )
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries;
      });
  }

  public onCountryChange(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        tap(() => this.myForm.get('border')?.setValue('')),
        filter((value: string) => value.length > 0),
        switchMap((alphaCode) =>
          this.countriesService.getCountriesByAlphaCode(alphaCode)
        ),
        switchMap((country) =>
          this.countriesService.getCountryBordersByCodes(country.borders)
        )
      )
      .subscribe((countries) => {
        this.borders = countries;
      });
  }
}
