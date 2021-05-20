class BarChart{
    constructor(config, data){
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

        self.xscale = d3.scaleBand().range([0, self.inner_width]).paddingInner(0.3)
        self.yscale = d3.scaleLinear().range([self.inner_height,0])
        self.xaxis = d3.axisBottom(self.xscale).tickSizeOuter(0)
        self.yaxis = d3.axisLeft(self.yscale).ticks(10).tickSizeOuter(0)
        
        self.xaxis_group = self.chart.append('g').attr('transform', `translate(0, ${self.inner_height})`)
        self.yaxis_group = self.chart.append('g')

    }
    
    update(){
        let self = this

        const xmin = 0
        let value_array = []
        for(let i = 0;i < self.data.length;i++){
            value_array.push(parseInt(self.data[i].value))
        }
        const xmax = Math.max.apply(null, value_array)
        self.yscale.domain([xmin,xmax])
        self.xscale.domain(self.data.map(d => d.label))
        
        self.render()
        self.onClickSort()
    }

    render(){
        let self = this

        self.title.text('県別人口')
            .attr('x',(self.inner_width - self.config.margin.left)/ 2)
            .attr('y',self.config.margin.top -10)
            .attr('font-weight','bold')
            .attr('font-size',40)

        self.chart.selectAll('rect').data(self.data)
            .join('rect')
            .transition().duration(500)
            .attr('x',d => self.xscale(d.label))
            .attr('y',d => self.yscale(d.value))
            .attr('width', self.xscale.bandwidth())
            .attr('height', d => self.inner_height -self.yscale(d.value))

        self.xaxis_group.call(self.xaxis).append('text')
            .attr("fill", "black")
            .attr('x',self.inner_width/2)
            .attr('y',self.config.margin.bottom)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .text("都道府県")
        
        self.yaxis_group.call(self.yaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x', -self.inner_height/2)
            .attr('y', -80)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr('transform','rotate(-90)')
            .text("人口(人)")

    }

    onClickSort(){
        let self = this
        const pre_array = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']


        d3.select('#reverse')
        .on('click', d => {
            self.data.reverse()
            self.update()
        })

        d3.select('#value-sort')
        .on('click',d =>{
            self.data.sort((x,y) => y.value - x.value)
            self.update()
        })

        d3.select('#name-sort')
        .on('click',d =>{
            self.data.sort((x, y) => pre_array.indexOf(x.label) - pre_array.indexOf(y.label))
            self.update()
        })
    }

}


d3.csv('https://kotaasano.github.io/infoviz2021/W08/w08_task01.csv')
.then(data => {
    data.forEach(d => {
        d.value = +d.value
    })

    var config ={
        parent : '#drawing_region',
        width : 256 * 7,
        height : 256 * 2,
        margin : {top:60, right:10, bottom:40, left:100}
    }


    const bar_chart = new BarChart(config,data)
    bar_chart.update()
    
})
.catch(error => {console.log(error)})