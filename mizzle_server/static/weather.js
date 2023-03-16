
console.log("hello");
var dat;

function get_time_domain(data) {
    
}
function get_domain(data, func) {
    min = func(data[0]);
    max = func(data[0]);
    for (i in data) {
        min = func(data[i]) < min ? func(data[i]) : min;
        max = func(data[i]) > max ? func(data[i]) : max;
    }
    return [Math.floor(min)-1, Math.ceil(max)+1];
}
function get_temp_domain(data) {
    return get_domain(data, function(d) {return d.temp_air; });
}
function get_pressure_domain(data) {
    return get_domain(data, function(d) {return d.pressure; });
}
function get_humidity_domain(data) {
    return get_domain(data, function(d) {return d.humidity; });
}

function update_graph(data) {
    // Parse timestamps from iso strings into Date objects
    for (i in data) {
        data[i].time = new Date(data[i].time);
    }

    const axis_width = 700;
    const axis_height = 600;
    const margin = {
        left: 140,
        right: 20,
        top: 10,
        bottom: 10,
    };
    const svg_width = axis_width + margin.left + margin.right;
    const svg_height = axis_width + margin.top + margin.bottom;

    var svg = d3.select('#area')
        .append('svg')
        //.classed('svg-container', true)
        .attr('width', svg_width)
        .attr('height', svg_height)
        .style("display", "block")
        .style("margin", "auto")
        //.attr('viewBox', '0 0 600 300')
        //.attr('class', 'svg-content-responsive')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // X axis scale
    var x =
        d3.scaleTime()
        .domain(d3.extent(data, function (d) {return d.time;}))
        .range([0, axis_width]);

    const y_meta = [
        {
            text_label: 'Temp.',
            unit_label: '[C]',
            height: 0.6,
            domain: get_temp_domain(data),
        },
        {
            text_label: 'Pressure',
            unit_label: '[kPa]',
            height: 0.2,
            domain: get_pressure_domain(data),
        },
        {
            text_label: 'Humidity',
            unit_label: '[%]',
            height: 0.2,
            domain: get_humidity_domain(data),
        },
    ];
    var y_axis_start=0;
    for (i in y_meta) {

        // Calculate the axis position
        const fig_height = y_meta[i].height * axis_height;
        const range = [y_axis_start + fig_height, y_axis_start];
        y_axis_start += fig_height;

        // Axis scale
        y_meta[i]['scale'] =
            d3.scaleLinear()
            .domain(y_meta[i].domain)
            .range(range);

        // Add y axis
        svg.append('g')
            .append('g')
            .call(d3.axisLeft(y_meta[i].scale));

        console.log(range);

        const label_offset = 10;
        svg.append('text')
            .attr('text-anchor', 'middle')
            //.attr('transform', 'rotate(-90)')
            .attr('x', -margin.left/2.0)
            .attr('y', (range[0] + range[1])/2.0 - label_offset)
            .text(y_meta[i].text_label);
        svg.append('text')
            .attr('text-anchor', 'middle')
        //.attr('transform', 'rotate(-90)')
            .attr('x', -margin.left/2.0)
            .attr('y', (range[0] + range[1])/2.0 + label_offset)
            .text(y_meta[i].unit_label);

    }

    // Add x axis
    svg.append('g')
        .attr('transform', 'translate(0, ' + axis_height + ')')
        .call(d3.axisBottom(x));

    // Add air temperature data points
    svg.selectAll('whatever')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {return x(d.time); })
        .attr('cy', function(d) {return y_meta[0].scale(d.temp_air); })
        .attr('r', 2);

    //svg.selectAll('whatever')
    //    .data(data)
    //    .enter()
    //    .append('circle')
    //    .attr('cx', function(d) {return x(d.time); })
    //    .attr('cy', function(d) {return y_meta[1].scale(d.pressure); })
    //    .attr('r', 2);

    data.unshift(data.at(0));
    data.push(data.at(-1));
    data[0].pressure = y_meta[1].domain[0];
    data[data.length-1].pressure = y_meta[1].domain[0];
    data[0].humidity = y_meta[2].domain[0];
    data[data.length-1].humidity = y_meta[2].domain[0];

    svg.append('path')
        .datum(data)
        .attr('fill', '#4466ee')
        .attr('opacity', 0.8)
        .attr('stroke', '#000')
        .attr('stroke-width', '1')
        .attr('d', d3.line()
              .curve(d3.curveBasis)
              .x(function(d) {return x(d.time); })
              .y(function(d) {return y_meta[1].scale(d.pressure); })
             );

    svg.append('path')
        .datum(data)
        .attr('fill', '#4466ee')
        .attr('opacity', 0.2)
        .attr('d', d3.line()
              .curve(d3.curveBasis)
              .x(function(d) {return x(d.time); })
              .y(function(d) {return y_meta[2].scale(d.humidity); })
             );


    //svg.selectAll('whatever')
    //    .data(data)
    //    .enter()
    //    .append('circle')
    //    .attr('cx', function(d) {return x(d.time); })
    //    .attr('cy', function(d) {return y_meta[2].scale(d.humidity); })
    //    .attr('r', 2);

}

function get_data(hour_bucket_size) {
    const url = encodeURI(window.location.href + '/data/' + hour_bucket_size);
    fetch(url)
        .then((response) => response.text())
        .then((d) => {
            const data = JSON.parse(d);
            update_graph(data);
        });
}

get_data(1);

