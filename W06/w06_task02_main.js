class ScatterPlot{
    constructor(config,data){
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, bottom: 10, left: 10, right: 10}
        }
        this.data = data
        this.init()
    }

    init(){
        let self = this
        
        self.svg = d3.select(self.config.parent)
            .attr('width',self.config.width)
            .attr('height',self.config.height)

        self.chart = self.svg.append('g')
            .attr('transform',`translate(${self.config.margin.left},${self.config.margin.top})`)

        self.title = self.svg.append('text')

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom

        self.xscale = d3.scaleLinear().range([0,self.inner_width ])
        self.yscale = d3.scaleLinear().range([self.inner_height ,self.config.margin.top])
        self.xaxis = d3.axisBottom(self.xscale).ticks(10)
        self.yaxis = d3.axisLeft(self.yscale).ticks(10)
        self.xaxis_group = self.chart.append('g').attr('transform',`translate(0,${self.inner_height})`)
        self.yaxis_group = self.chart.append('g').attr('transform',`translate(${self.config.margin.left},0`)
    }

    update(){
        let self = this
        const xmin = d3.min(self.data, d => d.x)
        const xmax = d3.max(self.data, d => d.x)   
        self.xscale.domain([0,xmax+30])
        const ymin = d3.min(self.data, d => d.y)
        const ymax = d3.max(self.data, d => d.y)
        self.yscale.domain([0,ymax+10])
        self.render()
    }

    render(){
        let self = this

        self.title.text('Task02 Data')
        .attr('x',(self.inner_width - self.config.margin.left)/ 2)
        .attr('y',self.config.margin.top )
        .attr('font-weight','bold')
        .attr('font-size',20)

        self.chart.selectAll('circle')
        .data(self.data).enter()
        .append('circle')
        .attr('cx', d => self.xscale(d.x))
        .attr('cy', d => self.yscale(d.y))
        .attr('r', d => d.r)

        self.xaxis_group.call(self.xaxis)
        .append('text')
        .attr("fill", "black")
        .attr('x',self.inner_width/2)
        .attr('y',self.config.margin.bottom)
        .attr('font-size',20)
        .attr('font-weight','bold')
        .text("X Label")

        self.yaxis_group.call(self.yaxis)
        .append('text')
        .attr("fill", "black")
        .attr('x',-self.config.margin.left)
        .attr('y',-self.config.margin.top*2)
        .attr('font-size',20)
        .attr('font-weight','bold')
        .attr('transform','rotate(-90)')
        .text("Y Label")

        //self.chart.append('text').text('X label').attr('x',self.config.margin.left + 60).attr('y',self.inner_height + self.config.margin.bottom )
        //self.chart.
        
        //self.xaxis_group.append('text').text('X label').attr('x',50).attr('y',5)
    }
}

d3.csv('https://kotaasano.github.io/infoviz2021/W04/data.csv')
.then(data => {
    data.forEach(d => {
        d.x = +d.x
        d.y = +d.y
    })

    var config ={
        parent : '#drawing_region',
        width : 512,
        height : 256,
        margin : {top:15, right:10, bottom:40, left:50}
    }

    const scatter_plot = new ScatterPlot(config,data)
    scatter_plot.update()
})
.catch(error => {console.log(console.error())})