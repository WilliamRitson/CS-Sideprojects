import { Component, OnInit } from '@angular/core';
import { DiscreteDistribution, BinomialDistribution } from './distribution';

@Component({
  selector: 'app-probability-distribution',
  templateUrl: './probability-distribution.component.html',
  styleUrls: ['./probability-distribution.component.css']
})
export class ProbabilityDistributionComponent implements OnInit {

  distr: DiscreteDistribution;

  constructor() {
    this.distr = new BinomialDistribution();
  }

  ngOnInit() {
  }

}
