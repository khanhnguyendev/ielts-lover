import QuickChart from 'quickchart-js';

// Maps IELTS chart type labels → Chart.js types understood by QuickChart
const IELTS_TO_CHARTJS: Record<string, string> = {
    bar_chart: 'bar',
    line_graph: 'line',
    pie_chart: 'pie',
    mixed_chart: 'bar',   // fallback: render as bar
    doughnut: 'doughnut',
    // passthrough for Chart.js native types
    bar: 'bar',
    line: 'line',
    pie: 'pie',
};

// Types that cannot be rendered as a Chart.js chart (process, map, table, etc.)
const NON_RENDERABLE = new Set(['process_diagram', 'map', 'table', 'process']);

export class ChartRenderer {
    /**
     * Renders a Chart.js config to a PNG buffer via QuickChart.
     * Returns null when the chart type cannot be rendered (e.g. process_diagram, map, table).
     */
    static async render(chartConfig: any): Promise<Buffer | null> {
        const rawType: string = chartConfig?.type ?? '';

        // Skip non-renderable IELTS types gracefully
        if (NON_RENDERABLE.has(rawType)) {
            return null;
        }

        const resolvedType = IELTS_TO_CHARTJS[rawType] ?? rawType;

        const chart = new QuickChart();
        chart.setWidth(800);
        chart.setHeight(400);
        chart.setBackgroundColor('white');

        chart.setConfig({
            type: resolvedType,
            data: chartConfig.data,
            options: {
                title: {
                    display: true,
                    text: chartConfig.title || 'IELTS Writing Task 1'
                },
                scales: resolvedType !== 'pie' && resolvedType !== 'doughnut'
                    ? { yAxes: [{ ticks: { beginAtZero: true } }] }
                    : undefined,
            }
        });

        const buffer = await chart.toBinary();
        return buffer;
    }
}
