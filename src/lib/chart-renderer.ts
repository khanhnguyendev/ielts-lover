import QuickChart from 'quickchart-js';
import { IELTS_TO_CHARTJS, CHART_TYPE_NON_RENDERABLE } from '@/lib/constants';

export class ChartRenderer {
    /**
     * Renders a Chart.js config to a PNG buffer via QuickChart.
     * Returns null when the chart type cannot be rendered (e.g. process_diagram, map, table).
     */
    static async render(chartConfig: any): Promise<Buffer | null> {
        const rawType: string = chartConfig?.type ?? '';

        // Skip non-renderable IELTS types gracefully
        if (CHART_TYPE_NON_RENDERABLE.has(rawType)) {
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
