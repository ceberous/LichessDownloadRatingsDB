const request = require( "request" );
const pALL = require( "p-all" );

function sleep( ms ) { return new Promise( resolve => setTimeout( resolve , ms ) ); }
module.exports.sleep = sleep;

function MAKE_REQUEST( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			request( { url: wURL , headers: { "Cache-Control": "private, no-store, max-age=0" } } , async function ( err , response , body ) {
				if ( err ) { resolve( false ); return; }
				console.log( wURL + "\n\t--> RESPONSE_CODE = " + response.statusCode.toString() );
				if ( response.statusCode !== 200 ) {
					//console.log( "bad status code ... " );
					resolve( false );
					return;
				}
				else {
					resolve( body );
					return;
				}
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.makeRequest = MAKE_REQUEST;


function MAKE_REQUEST_WITH_WAIT( wURL ) {
	return new Promise( async function( resolve , reject ) {
		try {
			let body = await MAKE_REQUEST( wURL );
			if ( !body ) {
				console.log( "sleeping for 3 seconds" );
				await sleep( 3000 );
				body = await MAKE_REQUEST( wURL );
				if ( !body ) {
					console.log( "sleeping for 10 seconds" );
					await sleep( 10000 );
					body = await MAKE_REQUEST( wURL );
					if ( !body ) {
						console.log( "Banned ... PepeHands" );
						process.exit( 1 );
					}
				}
			}
			resolve( body );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.makeRequestWithWait = MAKE_REQUEST_WITH_WAIT;

function PROMISE_FUNCTION_TO_ALL_ARRAY( wArray , wFunction , wConcurrency ) {
	return new Promise( function( resolve , reject ) {
		try {
			wConcurrency = wConcurrency || 3;
			let wActions = wArray.map( x => async () => { let x1 = await wFunction( x ); return x1; } );
			pALL( wActions , { concurrency: wConcurrency } ).then( result => {
				resolve( result );
			});
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.promiseAll = PROMISE_FUNCTION_TO_ALL_ARRAY;


function GET_INDEX_OF_LARGEST_IN_ARRAY( wArray ) {
	return wArray.reduce( ( iMax , x , i , arr ) => x > arr[ iMax ] ? i : iMax , 0 );
}
module.exports.getLargestIndexInArray = GET_INDEX_OF_LARGEST_IN_ARRAY;