class ScatterPlot{
    constructor(config,data){
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, left: 10, right: 10, bottom: 10},
            radius: config.radius || 5,
            color_set: config.color_set|| ["gray","pink","blue", "green", "orange", "red","skyblue"]
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
        self.xaxis = d3.axisBottom(self.xscale).ticks(10).tickSizeOuter(0)
        self.yaxis = d3.axisLeft(self.yscale).ticks(10).tickSizeOuter(0).tickFormat(d => d === 70　? d +' %' : d+"")

        self.xaxis_group = self.chart.append('g').attr('transform',`translate(${self.config.margin.left},${self.inner_height})`)
        self.yaxis_group = self.chart.append('g').attr('transform',`translate(${self.config.margin.left},0)`)

        self.color_scale = d3.scaleOrdinal().range(self.config.color_set)
            .domain(['東北','関東','中部','近畿','中国','四国','九州'])

        self.x_data_type = ''

    }

    update(){
        let self = this

        self.cvalue = d => d.area
        
        //ドメインの設定
        const xmin = 0
        let xmax = d3.max(self.data, d => d.cram_school_num) + 500

        switch(self.x_data_type){
            case 'cram_school_num':
                xmax = d3.max(self.data, d => d.cram_school_num) + 500
                break
            case 'college_num':
                xmax = d3.max(self.data, d => d.college_num) + 20
                break
            case 'student_num':
                xmax = d3.max(self.data, d => d.student_num) + 20
                console.log(xmax)
                break
            case 'prefectural_income':
                xmax = d3.max(self.data, d => d.prefectural_income) + 500
                break
        }

        const ymin = 35
        const ymax = 70
    
        self.xscale.domain([xmin,xmax])
        self.yscale.domain([ymin,ymax])

        self.render()
    }

    render(){
        let self = this
        let x_label = '学習塾数 (校)'

        //タイトルの描写
        self.title.text('大学進学率と各項目の相関')
            .attr('x',(self.inner_width - self.config.margin.left)/ 2　- 100)
            .attr('y',self.config.margin.top )
            .attr('font-weight','bold')
            .attr('font-size',20)

        
        //プロット
        self.chart.selectAll('circle').data(self.data).enter().append('circle')
                        .attr('cx', d => self.xscale(d.cram_school_num))
                        .attr('cy', d => self.yscale(d.college_enrollment_rate))
                        .attr('r', self.config.radius)
                        .attr('transform',`translate(${self.config.margin.left},0)`)
                        .attr('fill',　d => self.color_scale(self.cvalue(d)))
                        .attr('class', d => {
                            if(d.area === "東北"){
                                return "tohoku"
                            }
                            if(d.area === "関東"){
                                return "kanto"
                            }
                            if(d.area === "中部"){
                                return "tyubu"
                            }
                            if(d.area === "近畿"){
                                return "kinki"
                            }
                            if(d.area === "中国"){
                                return "tyugoku"
                            }
                            if(d.area === "四国"){
                                return "shikoku"
                            }
                            if(d.area === "九州"){
                                return "kyushu"
                            }
                        })

        //x軸データの変換
        switch(self.x_data_type){
            case 'cram_school_num':
                self.chart.selectAll('circle')
                    .transition().duration(400)
                    .attr('cx', d => self.xscale(d.cram_school_num))
                x_label = '学習塾数 (校)'
                break
            case 'college_num':
                self.chart.selectAll('circle')
                    .transition().duration(400)
                    .attr('cx', d => self.xscale(d.college_num))
                x_label = '大学数 (校)'
                break
            case 'student_num':
                self.chart.selectAll('circle')
                    .transition().duration(400)
                    .attr('cx', d => self.xscale(d.student_num))
                x_label = '卒業生徒数 (人)'
                break
            case 'prefectural_income':
                self.chart.selectAll('circle')
                    .transition().duration(400)
                    .attr('cx', d => self.xscale(d.prefectural_income))
                x_label = '県民所得 (円/単位1000)'
                break
        }

        //x軸の描写
        self.xaxis_group.call(self.xaxis)
        
        self.chart.select('text')
            .attr("fill", "black")
            .attr('x',self.inner_width/2)
            .attr('y',self.config.margin.bottom-20)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .text(x_label)

        //y軸の描写
        self.yaxis_group.call(self.yaxis)
            .append('text')
            .attr("fill", "black")
            .attr('x',-self.inner_width/4)
            .attr('y',-self.config.margin.top*2)
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr('transform','rotate(-90)')
            .text("大学進学率")
        
    }

    replaceXData(){
        let self = this

        d3.select('#cram_school_num')
        .on('click', d =>{
            self.x_data_type = 'cram_school_num'
            self.update()
        })

        d3.select('#college_num')
        .on('click', d =>{
            self.x_data_type = 'college_num'
            self.update()
        })

        d3.select('#student_num')
        .on('click', d =>{
            self.x_data_type = 'student_num'
            self.update()
        })
        d3.select('#prefectural_income')
        .on('click', d =>{
            self.x_data_type = 'prefectural_income'
            self.update()
        })

    }

    showTooltip(){
        let self = this

        //点のtooltip
        self.chart.selectAll('circle')
        .on('mouseover', (e,d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .html(`<div class="tooltip-label">${d.prefecture}</div>
                <p>${d.area}地方, 大学進学率：${d.college_enrollment_rate}%</p>
                <p>学習塾数：${d.cram_school_num}校, 大学数：${d.college_num}校</p>
                <p>高校卒業生徒数：${d.student_num}人, 県民所得：${d.prefectural_income}万円</p>`)
            
            if(e.target.attributes['r'].value > self.config.radius){
                d3.select(e.target)
                    .transition().duration(250)
                    .attr('r', self.config.radius)

            }else{
                d3.select(e.target)
                    .transition().duration(250)
                    .attr('r', self.config.radius * 3)
            }
            
        })
        .on('mousemove', (e) => {
            const padding = 10;
            d3.select('#tooltip')
                .style('left', (e.pageX + padding) + 'px')
                .style('top', (e.pageY + padding) + 'px')
        })
        .on('mouseleave', (e) => {
            d3.select('#tooltip').style('opacity', 0)
        })

    }


}

class PieChart{
    constructor(config,data){
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top: 10, bottom: 10, left: 10, right: 10},
            radius: config.radius || 5,
            color_set: config.color_set|| ["gray","pink","blue", "green", "orange", "red","skyblue"]
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
       
        let tohoku_rate=0
        let kanto_rate = 0
        let tyubu_rate = 0
        let kinki_rate = 0
        let tyugoku_rate = 0
        let shikoku_rate = 0
        let kyushu_rate = 0
        for(let i=0;i< self.data.length ;i++){
            switch(self.data[i].area){
                case '東北':
                    tohoku_rate += self.data[i].college_enrollment_rate
                    break
                case '関東':
                    kanto_rate += self.data[i].college_enrollment_rate
                    break
                case '中部':
                    tyubu_rate += self.data[i].college_enrollment_rate
                    break
                case '近畿':
                    kinki_rate += self.data[i].college_enrollment_rate
                    break
                case '中国':
                    tyugoku_rate += self.data[i].college_enrollment_rate
                    break
                case '四国':
                    shikoku_rate += self.data[i].college_enrollment_rate
                    break
                case '九州':
                    kyushu_rate += self.data[i].college_enrollment_rate
                break
            }
        }
        
        self.area_rate_list = [
            {area:"東北", value:tohoku_rate},
            {area:"関東", value:kanto_rate},
            {area:"中部", value:tyubu_rate},
            {area:"近畿", value:kinki_rate},
            {area:"中国", value:tyugoku_rate},
            {area:"四国", value:shikoku_rate},
            {area:"九州", value:kyushu_rate}
        ]

        self.pie = d3.pie().sort(null).value(d => d.value)(self.area_rate_list)

        self.radius = Math.min( self.inner_width, self.inner_height ) / 2

        self.arc = d3.arc().innerRadius(self.radius -150).outerRadius(self.radius)
        self.text_arc = d3.arc().outerRadius(self.radius).innerRadius(self.radius)
        self.color_scale = d3.scaleOrdinal().range(self.config.color_set)
    }

    update(){
        let self = this

        self.cvalue = d => d.value

        self.render()
    }

    render(){
        let self = this

        //タイトルの描写
        self.title.text('地方ごとの大学進学率の割合')
            .attr('x',(self.inner_width - self.config.margin.left)/ 2　- 70)
            .attr('y',self.config.margin.top )
            .attr('font-weight','bold')
            .attr('font-size',20)

        self.chart.selectAll('pie').data(self.pie).enter()
            .append('path')
            .attr('d', self.arc)
            .attr('fill',　d => self.color_scale(self.cvalue(d)))
            .style('stroke-width', '2px')
            .attr("opacity", 0.8)
        
        self.chart.selectAll('text').data(self.pie).enter()
            .append('text')
            .attr("text-anchor", "middle")
            .text(d => d.data.area)
            .attr('fill','white')
            .attr('font-size',20)
            .attr('font-weight','bold')
            .attr("transform", d => `translate(${self.arc.centroid(d)})`)
    }

    selectArea(){
        let self = this

        self.chart.selectAll('path')
        .on('click', (e,d) => {
            console.log(d.data.area)
            let area_class

        switch(d.data.area){
            case '東北':
                area_class = '.tohoku'
                break
            case '関東':
                area_class = '.kanto'
                break
            case '中部':
                area_class = '.tyubu'
                break
            case '近畿':
                area_class = '.kinki'
                break
            case '中国':
                area_class = '.tyugoku'
                break
            case '四国':
                area_class = '.shikoku'
                break
            case '九州':
                area_class = '.kyushu'
                break
        }
        d3.selectAll(area_class).attr('r', self.config.radius * 3)    
        })
    }

}


d3.csv('https://kotaasano.github.io/infoviz2021/FinalTask/finaltask_data.csv')
.then(data => {
    data.forEach(d => {
        d.college_enrollment_rate = +d.college_enrollment_rate
        d.cram_school_num = +d.cram_school_num
        d.college_num = +d.college_num
        d.student_num = +d.student_num
        d.prefectural_income = +d.prefectural_income
    })

    const color_set = ["gray","pink","blue", "green", "orange", "red","skyblue"]

    var config_plot ={
        parent : '#drawing_region',
        width : 256 * 2.5,
        height : 256 * 2,
        margin : {top:20, right:50, bottom:50, left:30},
        radius : 5,
        color_set : color_set
    }

    var config_pie ={
        parent : '#drawing_region2',
        width : 256 * 2,
        height : 256 * 2,
        margin : {top:20, right:50, bottom:50, left:30},
        radius : 5,
        color_set : color_set
    }

    const scatter_plot = new ScatterPlot(config_plot,data)
    const pie_chart = new PieChart(config_pie,data)

    scatter_plot.update()
    scatter_plot.replaceXData()
    scatter_plot.showTooltip()
    
    pie_chart.update()
    pie_chart.selectArea()

    
})
.catch(error => {console.log(error)})