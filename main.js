const cheerio = require( "cheerio" );
const JFODB = require( "jsonfile-obj-db" );
const UTILS = require( "./generic_utils.js" );

const REAL_PUZZLE_MAX = 125272;

let puzzle_url_list = [];
let puzzle_index = 1;
let puzzle_max = 500; // +1 more than reality for convienience
const puzzle_url_base = "https://lichess.org/training/";
for ( puzzle_index; puzzle_index < puzzle_max; ++puzzle_index  ) {
	puzzle_url_list.push( puzzle_url_base + puzzle_index.toString() );
}

function custom_rating_scraper( url ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let body = await UTILS.makeRequestWithWait( url );
			try { var $ = cheerio.load( body ); }
			catch( err ) { resolve( -1 ); return; }
			let search_string = $( "body" ).html();
			search_string = search_string.replace( /\s/g , '' );
			let start = search_string.indexOf( 'puzzle":{"id"' );
			if ( !start ) { resolve( -1 ); return;  };
			let end = search_string.indexOf( '"attempts' , start );
			if ( !end ) { resolve( -1 ); return;  };
			let rating = search_string.substring( start , end );
			rating = rating.split( '"rating":' )[ 1 ];
			rating = rating.slice( 0 , -1 );
			console.log( rating );
			await UTILS.sleep( 1000 );
			resolve( rating );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

const test_urls = [ "https://lichess.org/training/5" ];
( async ()=> {

	const ratings_db = new JFODB( "ratings_db" );

	// let ratings = await UTILS.promiseAll( test_urls , custom_rating_scraper , 3 );
	// console.log( ratings );

	let ratings = await UTILS.promiseAll( puzzle_url_list , custom_rating_scraper , 1 );

	let set = [];

	for ( let i = 0; i < puzzle_url_list.length; ++i ) {
		let puzzle_id = puzzle_url_list[ i ].split( "training/" )[ 1 ];
		set.push( [ puzzle_id , parseInt( ratings[ i ] ) ] );
	}

	set = set.sort( function( a , b ) {
		return a[ 1 ] - b[ 1 ];
	});
	set = set.reverse();

	ratings_db.self[ "part_1" ] = set;
	ratings_db.save();

	console.log( set );

})();