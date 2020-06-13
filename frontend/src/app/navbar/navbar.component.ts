import { Component, OnInit } from '@angular/core';

import * as appSettings from 'tns-core-modules/application-settings';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ns-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  moduleId: module.id,
})
export class NavbarComponent implements OnInit {

  public usernameSubs: Subscription;
  public username: string

  constructor(private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this.username = appSettings.getString('username');
  }

}

