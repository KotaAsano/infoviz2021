class LineChart{
    constructor(config,data){
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, left: 10, right: 10, bottom: 10}
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
    }

    render(){
        let self = this
        const radius = 5
        const edge = 10

        self.title.text('2020年度各月の最高(最低)気温')
            .attr('x',(self.inner_width - self.config.margin.left)/ 2　- 100)
            .attr('y',self.config.margin.top )
            .attr('font-weight','bold')
            .attr('font-size',20)

        self.chart.append('path')
            .attr('d',self.line_maxtemp(self.data))
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr('transform',`translate(${self.config.margin.left},0)`)

        self.chart.append('path')
            .attr('d',self.line_mintemp(self.data))
            .attr('stroke', 'blue')
            .attr('fill', 'none')
            .attr('transform',`translate(${self.config.margin.left},0)`)

        self.chart.selectAll('circle').data(self.data).enter()
            .append('circle')
            .attr('cx', d => self.xscale(d.month))
            .attr('cy', d => self.yscale(d.maxtemp))
            .attr('r', radius)
            .attr('transform',`translate(${self.config.margin.left},0)`)
            .attr('fill','red')

        self.chart.selectAll('rect').data(self.data).enter()
            .append('rect')
            .attr('x', d => self.xscale(d.month)-edge/2)
            .attr('y', d => self.yscale(d.mintemp)-edge/2)
            .attr('width', edge)
            .attr('height', edge)
            .attr('transform',`translate(${self.config.margin.left},0)`)
            .attr('fill','blue')


        self.xaxis_group.call(self.xaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x',self.inner_width/2)
            .attr('y',self.config.margin.bottom)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .text("月")

        self.yaxis_group.call(self.yaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x',-self.inner_width/2 + 20)
            .attr('y',-self.config.margin.top*2)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr('transform','rotate(-90)')
            .text("気温(℃)")
        
        self.chart.append('text')
            .attr('fill','red')
            .attr('x',self.xscale(self.data[self.data.length - 1].month)+5)
            .attr('y',self.yscale(self.data[self.data.length - 1].maxtemp)+15)
            .attr('font-size',10)
            .attr('font-weight','bold')
            .text('最高気温')

        self.chart.append('text')
            .attr('fill','blue')
            .attr('x',self.xscale(self.data[self.data.length - 1].month)+5)
            .attr('y',self.yscale(self.data[self.data.length - 1].mintemp)+15)
            .attr('font-size',10)
            .attr('font-weight','bold')
            .text('最低気温')

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
        margin : {top:20, right:10, bottom:40, left:30}
    }


    const line_chart = new LineChart(config,data)
    line_chart.update()
})
.catch(error => {console.log(error)})