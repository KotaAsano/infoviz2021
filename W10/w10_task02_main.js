class ScatterPlot{
    constructor(config,data){
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, left: 10, right: 10, bottom: 10},
            radius: config.radius || 5,
            length_edge: config.length_edge || 10
        }
        this.data = data
        this.init()
    }

    init(){
        let self = this
        
        self.svg = d3.select(self.config.parent)
        .attr('width', self.config.width)
        .attr('height', self.config.height)
        
        
        self.chart = self.svg.append('g')
        .attr('transform',`translate(${self.config.margin.left},${self.config.margin.top})`)
        
        self.title = self.svg.append('text')

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom


        self.xscale = d3.scaleLinear().range([0,self.inner_width])
        self.yscale = d3.scaleLinear().range([self.inner_height,0])
        self.xaxis = d3.axisBottom(self.xscale).ticks(12).tickSizeOuter(0).tickFormat(d => d === 0　? '' : d + " 月")
        self.yaxis = d3.axisLeft(self.yscale).ticks(10).tickSizeOuter(0)

        self.xaxis_group = self.chart.append('g').attr('transform',`translate(${self.config.margin.left},${self.inner_height})`)
        self.yaxis_group = self.chart.append('g').attr('transform',`translate(${self.config.margin.left},0)`)


        self.line_maxtemp = d3.line()
            .x(d => self.xscale(d.month))
            .y(d => self.yscale(d.maxtemp))
        
        self.line_mintemp = d3.line()
            .x(d => self.xscale(d.month))
            .y(d => self.yscale(d.mintemp))
    }

    update(){
        let self = this

        const maxtemp = d3.max(self.data, d => d.maxtemp)
        const mintemp = d3.max(self.data, d => d.mintemp)

        const xmin = 0
        const xmax = d3.max(self.data, d => d.month) + 1
        const ymin = 0
        const ymax = (maxtemp >= mintemp) ? maxtemp + 10 : mintemp + 10
    
        self.xscale.domain([xmin,xmax])
        self.yscale.domain([ymin,ymax])

        self.render()
        self.showTooltip()
    }

    render(){
        let self = this

        //タイトルの描写
        self.title.text('2020年度各月の最高(最低)気温')
            .attr('x',(self.inner_width - self.config.margin.left)/ 2　- 100)
            .attr('y',self.config.margin.top )
            .attr('font-weight','bold')
            .attr('font-size',20)

        //辺の描写(最高気温)
        self.chart.append('path')
            .attr('d',self.line_maxtemp(self.data))
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr('transform',`translate(${self.config.margin.left},0)`)
        
        //辺の描写(最低気温)
        self.chart.append('path')
            .attr('d',self.line_mintemp(self.data))
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            .attr('transform',`translate(${self.config.margin.left},0)`)

        //点の描写(最高気温)
        self.chart.selectAll('circle').data(self.data).enter()
            .append('circle')
            .attr('cx', d => self.xscale(d.month))
            .attr('cy', d => self.yscale(d.maxtemp))
            .attr('r', self.config.radius)
            .attr('transform',`translate(${self.config.margin.left},0)`)
            .attr('fill','red')

        //点の描写(最低気温)
        self.chart.selectAll('rect').data(self.data).enter()
            .append('rect')
            .attr('x', d => self.xscale(d.month) - self.config.length_edge/2)
            .attr('y', d => self.yscale(d.mintemp) - self.config.length_edge/2)
            .attr('width', self.config.length_edge)
            .attr('height', self.config.length_edge)
            .attr('transform',`translate(${self.config.margin.left},0)`)
            .attr('fill','blue')

        //x軸の描写
        self.xaxis_group.call(self.xaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x',self.inner_width/2)
            .attr('y',self.config.margin.bottom)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .text("月")

        //y軸の描写
        self.yaxis_group.call(self.yaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x',-self.inner_width/2 + 20)
            .attr('y',-self.config.margin.top*2)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr('transform','rotate(-90)')
            .text("気温(℃)")

        
        
    }

    showTooltip(){
        let self = this

        //最高気温の点のtooltip
        self.svg.selectAll('circle')
        .on('mouseover', (e,d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`<div class="tooltip-label-maxtemp">${d.month}月</div>最高気温：${d.maxtemp}℃`)
            
            d3.select(e.target)
            .transition().duration(250)
            .attr('r', self.config.radius * 3)
            .style('fill', 'orange')
        })
        .on('mousemove', (e) => {
            const padding = 10;
            d3.select('#tooltip')
                .style('left', (e.pageX + padding) + 'px')
                .style('top', (e.pageY + padding) + 'px')
        })
        .on('mouseleave', (e) => {
            d3.select('#tooltip').style('opacity', 0)
            
            d3.select(e.target)
            .transition().duration(500)
            .attr('r', self.config.radius)
            .style('fill', 'red')
        })

        //最低気温のtooltip
        self.svg.selectAll('rect').on('mouseover', (e,d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`<div class="tooltip-label-mintemp">${d.month}月</div>最低気温：${d.mintemp}℃`)
            
            d3.select(e.target)
            .transition().duration(250)
            .attr('width', self.config.length_edge * 3)
            .attr('height', self.config.length_edge * 3)
            .style('fill', 'skyblue')
        })
        .on('mousemove', (e) => {
            const padding = 10;
            d3.select('#tooltip')
                .style('left', (e.pageX + padding) + 'px')
                .style('top', (e.pageY + padding) + 'px')
        })
        .on('mouseleave', (e) => {
            d3.select('#tooltip').style('opacity', 0)
            
            d3.select(e.target)
            .transition().duration(500)
            .attr('width', self.config.length_edge)
            .attr('height', self.config.length_edge)
            .style('fill', 'blue')
        })
    }
}


d3.csv('https://kotaasano.github.io/infoviz2021/W08/w08_task02.csv')
.then(data => {
    data.forEach(d => {
        d.month = +d.month
        d.maxtemp = +d.maxtemp
        d.mintemp = +d.mintemp
    })


    var config ={
        parent : '#drawing_region',
        width : 256 * 2,
        height : 256 * 2,
        margin : {top:20, right:10, bottom:40, left:30},
        radius : 5,
        length_edge : 10
    }


    const scatter_plot = new ScatterPlot(config,data)
    scatter_plot.update()
})
.catch(error => {console.log(error)})