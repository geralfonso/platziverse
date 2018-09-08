const { Line, mixins } = require('vue-chartjs');
const { reactiveProp } = mixins;

module.exports = {
  extends: Line,
  props: ['options'],
  mixins: [reactiveProp],
  mounted() {
    // Overwriting base render method with actual data.
    this.renderChart(this.chartData, this.options);
  }
};


/* const { Line, mixins } = require('vue-chartjs')
const { reactiveProp } = mixins

module.exports = Line.extend({
  mixins: [ reactiveProp ],
  props: [ 'options' ],
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}) */
