import React from 'react'
import Header from '../navs/Header'
import { ArrowRight, ArrowUpRight, ArrowDown, ArrowUp10Icon, ArrowUp } from 'lucide-react'


function HomePage() {

    const thoughtfulness=[
        {
            id:1,
            title:"Feel welcome",
            description:"A considered welcome helps a new place start to feel familiar.",

        },
        {
            id:2,
            title:"Know what to expect",
             description:"Thoughtful management and straightforward communication, from day one.",

        }, {
            id:3,
            title:"Make room for study",
            description:"A dependable base, ready for the work and discovery ahead.",

        }

    ];
  return (
    <>
    <div className="homePage">
        <Header/>
        <div className="home">
            <h2>Your Next Chapter  
                <br/>Starts here At Weru Hostels.
            </h2>
           
        </div>
        <div className="welcome">
            <p>A welcoming, thoughtfully managed student residence—so<br/>
             you can feel settled, find your rhythm and focus on what comes next.</p>
        </div>
        <div className="btns">
            <button className="discover">DISCOVER WERU HOSTELS <ArrowRight size={16} /></button>
            <button className="intouch">GET IN TOUCH  <ArrowUpRight size={14} /></button>
        </div>
    </div>
    <div className="new-place">
        
      
        <div className="home-pages">
             
            <div className="home-pages1">
                <p className="eyebrow"><span className="eyebrow__line" />——A GOOD PLACE TO BEGIN WITH</p>
                <h3>Students Life is a lot.</h3>
                 <h4>Home should feel simple.</h4>
            </div>
             <div className="home-pages2">
                <p>Weru hostel Student Living is made for the part of university life that happens after class. 
                    A place to come back to, with thoughtful management and a welcoming spirit at its heart.</p>

                 <p>We believe a dependable home gives you room to settle in,
                    make it your own and give your studies the attention they deserve.</p>

                    <h4>A little About us <ArrowRight/></h4>
            </div>
            
           
        
        </div>
        
    </div>
    <section id="about">
        <div className="about">
            <div className="about1">
                <p>——ABOUT WERU HOSTELS </p>
                <h3>A steadier kind of student living.</h3>
                
            </div>
             <div className="about2">
                <p>Moving into student accommodation is a big step. <br/>
                    We’re here to make the feeling of home part of<br/> the picture—with a warm welcome, clear
                    <br/> communication and a team that takes care of the details.</p>
                
            </div>
        </div>
    </section>
    <div className="thoughts">
  {thoughtfulness.map((item) => (
    <div key={item.id} className="ids-2">
      <p className="number">{String(item.id).padStart(2, '0')}</p>
      <h3>{item.title}</h3>
      <p className="description">{item.description}</p>
    </div>
  ))}
</div>

<div className="feeling">
    <div className="img">
        <img src="/weru.jpg"/>
    </div>
    <div className="place">
        <p className="matter">————THE FEELING THAT MATTER</p>
        <h3>A place to land.</h3>
        <h4>Space to become.</h4>
        <span className="pclassname">The best student home is more than 
            somewhere to sleep. It’s the quiet reassurance that 
            someone is looking after the place you call 
            home—while you get on with becoming yourself.</span><br/>
            <button className="ask-question">Ask question <ArrowRight/></button>
    </div>

</div>
<section id="contact">
    <div className="contact1">
        <p>——— Contact</p>
        <h3>A new place
        <br/>Starts with an Hello</h3>
        <span>Curious about Weru Hostels? We’d love to help you take the next step
         and learn more about student living with us.</span>
    </div>
    <div className="contact2">
        <button className="question">Have a question?<br/>Get in touch <ArrowUpRight/></button>
    </div>
</section>

    </>
  )
}

export default HomePage