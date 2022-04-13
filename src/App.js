import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {

	//Here are the states holding the data.
	const [characters, setCharacters] = useState([]);
	const [pages, setPages] = useState([]);
	const [activePage, setActivePage] = useState(1);
	const [loading, setLoading] = useState(false);

	//This function works every time the application is opened and the active page changes.
	useEffect(() => {
		getData();
	}, [activePage]);

	const getData = async () => {
		/*If there is data belonging to the active page in the storage, it is taken from here,
		  if not, it is brought from the api and assigned to the characters and the paging function is called.*/
		setLoading(true);
		const localCharacters = JSON.parse(sessionStorage.getItem(`${activePage}`));
		if(localCharacters) {
			const totalCharacters = JSON.parse(sessionStorage.getItem('total'));
			getPagination(totalCharacters/20);
			setCharacters(localCharacters);
			setLoading(false);
		}
		else{
			const response= await axios.get('https://gateway.marvel.com/v1/public/characters?offset='+((activePage*20)-20)+'&ts=1&apikey=e8f1680aa7c72ebcd49bb515a2ff3780&hash=ed007a9321750d29b2d2c7721a7f740c');
			getPagination(response.data.data.total/20);
			setCharacters(response.data.data.results);
			sessionStorage.setItem(`${activePage}`,  JSON.stringify(response.data.data.results));
			sessionStorage.setItem('total',  JSON.stringify(response.data.data.total));
			setLoading(false);
		}
	};

	const getPagination = (totalNumber) => {
		//The pagination section are assigned to the pages state according to the selected page number and the total page.
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
			<div className='dp-flex-wrap wd-100 main'>
				<ul className='dp-flex-wrap content'>
					{
						/* Here the characters are printed on the screen. */
						characters.length > 0 && 
						characters?.map((item, index) =>
							<li key={index} className="dp-flex-col ch-container">
								<img className="character" src={item.thumbnail.path+'/portrait_incredible.'+item.thumbnail.extension} />
								<span className='block-font ch-con-span'>{item.name}</span>
							</li>
						)
					}
				</ul>
				{
					loading && <div className='dp-flex loading'><span className='block-font'>Loading Characters...</span></div>
				}
			</div>
			<div className="dp-flex-row wd-100 footer">
				<div className="dp-flex transition">
					{/* Here the back button, next button and the page items are printed on the screen. */}
					{activePage>3 && <span><i className="fa-solid fa-angle-left fa-2xl grey-color trans-button" onClick={()=>skipPage(activePage-1)}></i></span>}
					{
						pages.map( (item,index) =>
							<span key={index} className={activePage===item ? 'block-font active-page' : 'block-font foot-tran-span grey-color'} onClick={item!=='...' ? ()=>skipPage(item) : null}>{item}</span>
						)
					}
					{activePage<pages[pages.length - 1]-3 && <span><i className="fa-solid fa-angle-right fa-2xl grey-color trans-button" onClick={()=>skipPage(activePage+1)}></i></span>}
				</div>
			</div>
		</div>
	);
}

export default App;
