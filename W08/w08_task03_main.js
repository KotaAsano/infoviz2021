class PieChart{
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
            .attr('width', self.config.width)
            .attr('height', self.config.height)
        
        
        self.chart = self.svg.append('g')
            .attr('transform',`translate(${self.config.width/2},${self.config.height/2})`)
        
        self.title = self.svg.append('text')

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom

        self.pie = d3.pie().value(d => d.share).sort(null)

        self.radius = Math.min( self.inner_width, self.inner_height ) / 2

        self.arc = d3.arc().innerRadius(self.radius -150).outerRadius(self.radius)
        self.text_arc = d3.arc().outerRadius(self.radius).innerRadius(self.radius)
        self.color = d3.scaleOrdinal().range(["blue", "green", "orange", "red"])
    }

    update(){
        let self = this

        self.render()
    }

    render(){
        let self = this


        self.chart.selectAll('pie').data(self.pie(self.data)).enter()
            .append('path')
            .attr('d', self.arc)
            .attr('fill',  d => self.color(d.index))
            .style('stroke-width', '2px')
            .attr("opacity", 0.8)
            
        

        
        self.chart.selectAll('text').data(self.pie(self.data)).enter()
            .append('text')
            .attr("text-anchor", "middle")
            .text(d => d.data.os)
            .attr('fill','white')
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr("transform", d => `translate(${self.arc.centroid(d)})`)
 
            
    }
}

d3.csv('https://kotaasano.github.io/infoviz2021/W08/w08_task03.csv')
.then(data => {
    data.forEach(d => {
        d.share = +d.share
    })

    var config ={
        parent : '#drawing_region',
        width : 256 * 2,
        height : 256 * 2,
        margin : {top:20, right:20, bottom:20, left:20}
    }

    const pie_chart = new PieChart(config,data)
    pie_chart.update()
})
.catch(error => {console.log(error)})