local grafana = import 'grafonnet/grafana.libsonnet';
local grafanaV7 = import './grafonnet-lib/grafonnet-7.0/grafana.libsonnet';
local le = '0.5';
local time = '1m';

grafana.dashboard.new(title='SLO',editable=true)
.addRow(
    grafana.row.new().addPanel(
         grafanaV7.panel.stat.new('Prometheus', 'graph')
         .setFieldConfig(unit='percentunit')
         .addTarget(
             grafanaV7.target.prometheus.new(
                datasource='Prometheus',
                expr='sum(rate(buy_baskets_bucket{le="%s", code=~"[2,3,4]..$"}[%s])) by (alias) /  ignoring(le)  sum(rate(buy_baskets_count{}[%s])) by (alias)' % [le,time,time],
                legendFormat='buy_baskets',
                format=null,
                interval='',             
             )
         )
          .addTarget(
             grafanaV7.target.prometheus.new(
                datasource='Prometheus',
                expr='sum(rate(buy_baskets_async_bucket{le="%s", code=~"[2,3,4]..$"}[%s])) by (alias) /  ignoring(le)  sum(rate(buy_baskets_async_count{}[%s])) by (alias)' % [le,time,time],
                legendFormat='buy_baskets_async',
                format=null,
                interval='',             
             )
         )
    )
){  
    gridPos+: {
        h: 24,
        w: 24,
        x: 0,
        y: 0,
    } 
}