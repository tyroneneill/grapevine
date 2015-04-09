/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/d3/d3.d.ts" />

module com.uk.grapevine {
    'use strict';

    export class TimeChart implements ng.IDirective {

        public graphElem: HTMLElement;
        public restrict: string;
        public template: string;
        public link: ($scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: TimeChartElement) => void;
        public renderGraph: (data: TimeChartData[]) => void;

        constructor(public $location: ng.ILocationService) {

            this.restrict = 'E';

            this.template = "<div class=\"timechart\"></div>";

            this.link = ($scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: TimeChartElement) => {
                console.log("Injection works: " + this.$location.absUrl());
                this.graphElem = element.children()[0];

                $scope.$watch(function() {
                    return attrs.data;
                }, this.renderGraph);
            }

            this.renderGraph = (value: any) => {
                var data: TimeChartData[] = JSON.parse(value);

                this.graphElem.innerHTML = "";

                if (data.length) {
                    var margin = { top: 10, right: 50, bottom: 70, left: 30 };
                    var width = this.graphElem.clientWidth - margin.left - margin.right;
                    var height = this.graphElem.clientHeight - margin.top - margin.bottom;

                    var parseDate = d3.time.format("%Y-%m-%d").parse;

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var line = d3.svg.line()
                        .x(function(d: TimeChartData) { return x(parseDate(d.time)); })
                        .y(function(d: TimeChartData) { return y(d.value); });

                    var svg = d3.select(this.graphElem).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    x.domain(d3.extent(data, function(d: TimeChartData) { return parseDate(d.time); }));
                    y.domain(d3.extent(data, function(d: TimeChartData) { return d.value; }));

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em");

                    svg.append("path")
                        .datum(data)
                        .attr("class", "line")
                        .attr("d", line);
                }  
            }
            
        }

        public static factory(): ng.IDirectiveFactory {
            var directive = ($location: ng.ILocationService) => new TimeChart($location);

            directive.$inject = ['$location'];

            return directive;
        }

    }

    export class TimeChartData {
        constructor(public value : number, public time : string) {

        }
    }

    export interface TimeChartElement extends ng.IAttributes {
        data: number;
    }
    
}
