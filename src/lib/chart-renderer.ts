import QuickChart from 'quickchart-js';

export class ChartRenderer {
    static async render(chartConfig: any): Promise<Buffer> {
        const chart = new QuickChart();

        // Basic configuration
        chart.setWidth(800);
        chart.setHeight(400);
        chart.setBackgroundColor('white');

        // Apply specific chart.js config
        chart.setConfig({
            type: chartConfig.type,
            data: chartConfig.data,
            options: {
                title: {
                    display: true,
                    text: chartConfig.title || "IELTS Writing Task 1"
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        // Get the image buffer
        const buffer = await chart.toBinary();
        return buffer;
    }
}
