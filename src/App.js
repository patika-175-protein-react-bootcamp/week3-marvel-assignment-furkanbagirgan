import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {

	/* If there is data belonging to active page in session storage,
	   this data is assigned to the characters state to be displayed on the screen.
	   Then the getPagination function is called to set the pagination part. */
	const [characters, setCharacters] = useState([]);
	const [pages, setPages] = useState([]);
	const [activePage, setActivePage] = useState(1);
	const [loading, setLoading] = useState(false);

	//de
	useEffect(() => {
		getData();
	}, [activePage]);

	const getData = async () => {
		//Session storage is checked first according to the page number selected here.
		setLoading(true);
		const localCharacters = JSON.parse(sessionStorage.getItem(`${activePage}`));
		if(localCharacters) {
			/* If there is data belonging to active page in session storage,
			  this data is assigned to the characters state to be displayed on the screen.
			  Then the getPagination function is called to set the pagination part. */
			const totalCharacters = JSON.parse(sessionStorage.getItem('total'));
			getPagination(totalCharacters/20);
			setCharacters(localCharacters);
			setLoading(false);
		}
		else{
			/* If there is no data belonging to the active page in session storage,
			   then it is connected to the API and the data is drawn from there and assigned to the characters state.
			   Then the getPagination function is called to set the pagination part. */
			const response= await axios.get('http://gateway.marvel.com/v1/public/characters?offset='+((activePage*20)-20)+'&ts=1&apikey=e8f1680aa7c72ebcd49bb515a2ff3780&hash=ed007a9321750d29b2d2c7721a7f740c');
			getPagination(response.data.data.total/20);
			setCharacters(response.data.data.results);
			sessionStorage.setItem(`${activePage}`,  JSON.stringify(response.data.data.results));
			sessionStorage.setItem('total',  JSON.stringify(response.data.data.total));
			setLoading(false);
		}
	};

	const getPagination = (totalNumber) => {
		/*  Here, the elements that will appear in the pagination section are
			assigned to the pages state according to the selected page number and the total page. */
		var readypage=[];
		switch(true){
		case (activePage<4):
			readypage.push(...[1,2,3,4,'...',totalNumber]);
			break;
		case (3<activePage && activePage<(totalNumber-3)):
			readypage.push(...[1,'...',activePage-1,activePage,activePage+1,'...',totalNumber]);
			break;
		case (activePage==(totalNumber-3)):
			readypage.push(...[1,'...',activePage-1,activePage,activePage+1,activePage+2,totalNumber]);
			break;
		case (activePage==(totalNumber-2)):
			readypage.push(...[1,'...',activePage-1,activePage,activePage+1,totalNumber]);
			break;
		case (activePage==(totalNumber-1)):
			readypage.push(...[1,'...',activePage-1,activePage,totalNumber]);
			break;
		default :
			readypage.push(...[1,'...',activePage-1,activePage]);
		}
		setPages(readypage);
	};

	const skipPage=(skippedPage)=>{
		//Here the selected page is switched and the scrollbar is moved up according to the width of the page.
		switch(true){
		case (window.innerWidth>1400):
			window.scrollTo(0, 1000);
			break;
		case (1400>window.innerWidth && window.innerWidth>1024):
			window.scrollTo(0, 700);
			break;
		case (1024>window.innerWidth && window.innerWidth>768):
			window.scrollTo(0, 400);
			break;
		default:
			window.scrollTo(0, 150);
			break;
		}
		setActivePage(skippedPage);
	};

	return (
		<div className='app'>
			{/* This is the part where the characters will appear */}
			<div id="main">
				{/* This is the list the characters are in */}
				<ul id="content">
					{
						/* Here the characters are printed on the screen. */
						characters.length > 0 && 
						characters?.map((item, index) =>
							<li key={index} className="ch-container">
								<img className="character" src={item.thumbnail.path+'/portrait_incredible.'+item.thumbnail.extension} />
								<span>{item.name}</span>
							</li>
						)
					}
				</ul>
				{
					/* The loading screen is shown here. */
					loading && <div className='loading'><span>Loading Characters...</span></div>
				}
			</div>

			{/* This is where the pagination will appear */}
			<div className="footer">
				{/* This is the list the pages are in */}
				<div className="transition">
					{/* Here the back button is printed on the screen. */}
					{activePage>3 && <span><i className="fa-solid fa-angle-left fa-2xl grey-color" onClick={()=>skipPage(activePage-1)}></i></span>}
					{
						/* Here the page items are printed on the screen. */
						pages.map( (item,index) =>
							<span key={index} id={activePage===item ? 'active-page' : ''} onClick={item!=='...' ? ()=>skipPage(item) : null}>{item}</span>
						)
					}
					{/* Here the next button is printed on the screen. */}
					{activePage<pages[pages.length - 1]-3 && <span><i className="fa-solid fa-angle-right fa-2xl grey-color" onClick={()=>skipPage(activePage+1)}></i></span>}
				</div>
			</div>
		</div>
	);
}

export default App;