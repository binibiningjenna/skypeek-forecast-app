am5.ready(function () {
    // Create root
    var root = am5.Root.new("hourlyForecastChart");

    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    // Create chart
    var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: true,
            panY: false,
            wheelX: "panX",
            wheelY: "zoomX",
            layout: root.verticalLayout
        })
    );

    // Define data
    var data = [
        { hour: "1 AM", temp: 24 },
        { hour: "2 AM", temp: 23 },
        { hour: "3 AM", temp: 22 },
        { hour: "4 AM", temp: 22 },
        { hour: "5 AM", temp: 21 },
        { hour: "6 AM", temp: 21 },
        { hour: "7 AM", temp: 22 },
        { hour: "8 AM", temp: 24 }
    ];

    // Create X Axis (Category)
    var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "hour",
            renderer: am5xy.AxisRendererX.new(root, {
                minGridDistance: 40,
                strokeOpacity: 0.2
            }),
            tooltip: am5.Tooltip.new(root, {})
        })
    );

    xAxis.get("renderer").labels.template.setAll({
        fill: am5.color(0xf2efeb)
    });

    xAxis.data.setAll(data);

    // Create Y Axis (Value)
    var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererY.new(root, {
                strokeOpacity: 0.2
            })
        })
    );

    yAxis.get("renderer").labels.template.setAll({
        fill: am5.color(0xf2efeb)
    });

    // Create series (Smoothed Line)
    var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
            name: "Temperature",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "temp",
            categoryXField: "hour",
            tooltip: am5.Tooltip.new(root, {
                labelText: "{valueY} °C"
            }),
            stroke: am5.color(0x00ffff)
        })
    );

    series.strokes.template.setAll({
        strokeWidth: 3
    });

    series.data.setAll(data);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
        behavior: "none",
        xAxis: xAxis
    }));

    // Animate
    series.appear(1000);
    chart.appear(1000, 100);
}); 