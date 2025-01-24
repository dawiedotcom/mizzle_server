
var dat;
const duration_pagination = document.getElementById('duration_pagination').children;
const graph_title = document.getElementById('graph_title');

function get_url_fragment() {
    const hash = window.location.hash;
    return hash.substring(1, hash.length);
}

function update_title(data) {

    const fragment = get_url_fragment();

    const end = data[0].time;
    const start = data[data.length-1].time;

    if (fragment == "hour" && start.getUTCDay() == end.getUTCDay()) {
        graph_title.innerHTML = (
            start.toLocaleTimeString() + " to " +
                end.toLocaleTimeString() + " " +
                end.toDateString()
        );
    }
    else if (fragment == "hour" || fragment == "day") {
        graph_title.innerHTML = (
            start.toLocaleTimeString() + " " + start.toDateString()
                + " to " +
                end.toLocaleTimeString() + " " + end.toDateString()
        );
    }
    else
        graph_title.innerHTML = start.toDateString() + " to " + end.toDateString();
}

function make_x_axis_label(data) {
}

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
function get_wind_speed_domain(data) {
    var wind_speed_min = get_domain(data, function(d) {return d.wind_speed_min; })[0];
    var wind_speed_max = get_domain(data, function(d) {return d.wind_speed_max; })[1];
    return [wind_speed_min, wind_speed_max];
}

function mouseover(d) {

}

function update_graph(data) {
    // Parse timestamps from iso strings into Date objects
    for (i in data) {
        data[i].time = new Date(data[i].time);
    }

    const axis_width = 700;
    const axis_height = 800;
    const margin = {
        left: 140,
        right: 140,
        top: 10,
        bottom: 50,
    };
    const svg_width = axis_width + margin.left + margin.right;
    const svg_height = axis_height + margin.top + margin.bottom;

    d3.selectAll('svg').remove();

    var svg = d3.select('#area')
        .append('svg')
        //.classed('svg-container', true)
        .attr('width', svg_width)
        .attr('height', svg_height)
        .style("display", "block")
        .style("margin", "auto")
        .on('mouseover', mouseover)
        //.attr('viewBox', '0 0 600 300')
        //.attr('class', 'svg-content-responsive')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    // X axis scale
    var x =
        d3.scaleTime()
        .domain(d3.extent(data, function (d) {return d.time;}))
        .range([0, axis_width]);

    // Color scheme from colorbrewer quantitative Dark2
    const y_meta = [
        {
            variable: 'temp_air',
            text_label: 'Temp.',
            unit_label: '[C]',
            height: 0.4,
            domain: get_temp_domain(data),
            stroke_color: '#1b9e77',
        },
        {
            variable: 'pressure',
            text_label: 'Pressure',
            unit_label: '[hPa]',
            height: 0.2,
            domain: get_pressure_domain(data),
            stroke_color: '#d95f02',
        },
        {
            variable: 'humidity',
            text_label: 'Humidity',
            unit_label: '[%]',
            height: 0.2,
            domain: get_humidity_domain(data),
            stroke_color: '#7570b3',
        },
        {
            variable: 'wind_speed_ave',
            fill_variables: ['wind_speed_min', 'wind_speed_max'],
            text_label: 'Wind Speed',
            unit_label: '[m/s]',
            height: 0.2,
            domain: get_wind_speed_domain(data),
            stroke_color: '#e7298a',
        },
    ];

    var y_axis_start=margin.top;
    for (i in y_meta) {

        // Calculate the axis position
        const fig_height = y_meta[i].height * axis_height;
        const range = [y_axis_start + fig_height, y_axis_start + (i == 0 ? 0 : 20)];
        y_axis_start += fig_height;

        // Axis scale
        y_meta[i]['scale'] =
            d3.scaleLinear()
            .domain(y_meta[i].domain)
            .range(range);

        // Add the top x-axis, but only show ticks for the first graph
        // Top most x axis
        const x_axis_top = i == 0 ? d3.axisTop(x) : d3.axisTop(x).tickFormat("");
        svg.append('g')
            .attr('transform', 'translate(0, ' + (range[1]) + ')')
            .call(x_axis_top);

        // Add the y axis on the left
        svg.append('g')
            .call(d3.axisLeft(y_meta[i].scale));

        // Add the y axis on the right
        svg.append('g')
            .attr('transform', 'translate(' + axis_width + ', 0)')
            .call(d3.axisRight(y_meta[i].scale));

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

        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('opacity', 0.8)
            .attr('stroke', y_meta[i].stroke_color)
            .attr('stroke-width', '2.5')
            .attr('d', d3.line()
                  .curve(d3.curveBasis)
                  .x(function(d) {return x(d.time); })
                  .y(function(d) {return y_meta[i].scale(d[y_meta[i].variable]); })
                 );

        // Add a fill around the graph if needed:
        if (y_meta[i].fill_variables) {
            svg.append('path')
                .datum(data)
                .attr('fill', y_meta[i].stroke_color)
                .attr('opacity', 0.5)
                .attr('d', d3.area()
                        .x(function(d, i) {return x(d.time); })
                        .y0(function(d) {return y_meta[i].scale( d[y_meta[i].fill_variables[1]] ); })
                        .y1(function(d) {return y_meta[i].scale( d[y_meta[i].fill_variables[0]] ); })
                );
        }

        // Add the x-axis, but only show ticks for the last graph
        const x_axis_bottom = i == y_meta.length-1 ? d3.axisBottom(x) : d3.axisBottom(x).tickFormat("");
        svg.append('g')
            .attr('transform', 'translate(0, ' + (y_axis_start) + ')')
            .call(x_axis_bottom);
    }

    /*
    const x_label = make_x_axis_label(data);
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', axis_width/2)
        .attr('y', 1.075 * axis_height)
        .text(x_label);
    */
}

function get_base_uri() {
    const uri = window.location.href.toString();
    const hash_pos = uri.indexOf('#');
    return uri.substring(0, hash_pos > 0 ? hash_pos : uri.length);
}

function update_data(minute_bucket_size) {
    const url = encodeURI(get_base_uri() + '/data/' + minute_bucket_size);
    fetch(url)
        .then((response) => response.text())
        .then((d) => {
            const data = JSON.parse(d);
            update_graph(data);
            update_title(data);
        });
}

function get_minute_bucket_size(fragment) {
    // Get the time bucket based on the url fragment
    if (fragment == 'hour') {
        return 1;
    } else if (fragment == 'day') {
        return 10;
    } else if (fragment == 'week') {
        return 60;
    } else if (fragment == 'month') {
        return 180;
    } else if (fragment == 'quarter') {
        return 720;
    } else if (fragment == 'year') {
        return 1448;
    }
    return 0;
}

function update_pagination(fragment) {
    for (var i=0; i<duration_pagination.length; i++) {
        const li = duration_pagination[i];
        li.classList = li.id.indexOf(fragment) > 0 ? "page-item active" : "page-item";
    }
}

onhashchange = (event) => {
    // Update the graph when the url fragment changes

    const fragment = get_url_fragment();
    const time_bucket = get_minute_bucket_size(fragment);
    if (time_bucket > 0) {
        update_data(time_bucket);
        update_pagination(fragment);
        return;
    }

    // 'redirect' to the hour selection for invalid fragments
    const next_uri = encodeURI(get_base_uri() + '#hour');
    window.history.replaceState({}, document.title, next_uri);
    update_data(1);
    update_pagination('hour');
};

// Initial load
onhashchange();
