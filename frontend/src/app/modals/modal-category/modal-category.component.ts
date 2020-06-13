import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Label } from 'tns-core-modules/ui/label';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';

import { ModalDialogParams } from 'nativescript-angular/directives/dialogs';

@Component({
  selector: 'ns-modal-category',
  templateUrl: './modal-category.component.html',
  styleUrls: ['./modal-category.component.css'],
  moduleId: module.id
})
export class ModalCategoryComponent implements OnInit {

  // Get elements from the template to temporary variables..
  @ViewChild('labelFollowed') public LabelFollowed: ElementRef;
  @ViewChild('labelAll') public LabelAll: ElementRef;
  @ViewChild('FilterArea') public FilterArea: ElementRef;

  // ..which'll be inserted into these variables after component has loaded
  public labelFollowed: Label;
  public labelAll: Label;
  public filterArea: StackLayout;

  // Order -options
  public orders = ['Uusimmat', 'Suosituimmat'];
  // Filter-area selector
  public filter: string;

  constructor(private _params: ModalDialogParams) {}

  ngOnInit() {
    this.getElements();
    this.checkFilter(this._params.context.showFilters);
    this.toggleLabel(this._params.context.filter);
  }


  /**
   * TRANSFER ELEMENTS TO VARIABLES
   *
   * Function which transfers elements gathered from template
   * via @ViewChild to local variables. These variables can be
   * modified in component.
   *
   */
  public getElements(): void {
    this.labelFollowed = this.LabelFollowed.nativeElement;
    this.labelAll = this.LabelAll.nativeElement;
    this.filterArea = this.FilterArea.nativeElement;
  }


  /**
   * CHECKS IF FILTERS WILL BE VISIBLE
   *
   * Function that checks if the calling component wants to see
   * filter-options too (order will always be visible).
   *
   * Filters are based on 2 categories: subscription and post's value.
   * Toggles between filters (Uusimmat/Suosituimmat).
   *
   * @param {boolean} filter Boolean value which tells if filters
   * will be shown.
   *
   */
  public checkFilter(filter: boolean): void {
    if (!filter) this.filterArea.visibility = 'collapse';
  }


  /**
   * CHANGES BETWEEN ACTIVE FILTER
   *
   * Function which toggles between two filters (Kaikki & Seuratut).
   * Class will be added to a selected filter.
   *
   * @param {string} filter Contains text about which filter-option
   * will be chosen.
   *
   */
  public toggleLabel(filter: string): void {
    if (filter === 'Kaikki') {
      this.filter = 'Kaikki';
      this.labelAll.className = 'selectedLabel';
      this.labelFollowed.className = 'dismissedLabel';
    } else {
      this.filter = 'Seuratut';
      this.labelAll.className = 'dismissedLabel';
      this.labelFollowed.className = 'selectedLabel';
    }
  }


  /**
   * RETURNS THE CHOOSEN FILTER-OPTION(S) BACK TO THE CALLER
   *
   * Function which'll return the chosen filter-option(s) back. If the
   * component who called this modal doesn't want full filters returned
   * (showAllFilters is false) it'll only return lower area-filters.
   *
   * @param {string} order Order-choice from order-layout
   * which'll be returned back to the caller.
   *
   */
  public chooseOption(order: string): void {
    this._params.closeCallback(
      this._params.context.showFilters
        ? { order: order, filter: this.filter } : order
    );
  }


}
