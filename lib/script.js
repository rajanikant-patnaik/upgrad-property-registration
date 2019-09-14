/**
 * New script file
 *//*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global getAssetRegistry getFactory emit */

/**
 * Create a new property
 * @param {org.property.registration.createProperty} tx
 * @transaction
 */

async function createProperty(tx){
	console.log('Property Creation Transaction');
	const factory = getFactory();
	const NS = 'org.property.registration';
	const me = getCurrentParticipant();
	
	//Add new property
	const property = factory.newResource(NS, 'Property', tx.PID);
	property.marketPrice = tx.marketPrice;
	property.regDate = tx.regDate;
	property.propertyType = tx.propertyType;
	property.location = tx.location;
	property.owner = me;
	
	// save the property
    const registry = await getAssetRegistry(property.getFullyQualifiedType());
    const exists = await registry.get(tx.PID).catch(err => {
        //await registry.add(property);
    })
    if(exists)
    {
        throw new Error('Propert with PID already Exists in the Properties');
    }
    else{
        await registry.add(property);
    }
}


/**
 * Set a property ready for sale
 * @param {org.property.registration.intentForSale} tx
 * @transaction
 */

async function intentForSale(tx){
	console.log('Property Setting up for Sale Transaction');
    
    //Get User details    
    const factory = getFactory();
    const NS = 'org.property.registration';
    const me = getCurrentParticipant();
    
    //creating anew id for listing 
    const plid = tx.property.PID+Date.parse(new Date());    
    //Add property to Property Listing Asset Registry
    const propertylisting = factory.newResource(NS, 'PropertyListing', plid);
    //update property listin's property objet with input
          propertylisting.property=tx.property;

    //create instance of property assest
    let property = factory.newResource(NS, 'Property', tx.property.PID);
    //create registry for same
    const registryproperty = await getAssetRegistry(property.getFullyQualifiedType());

    //update  property objet with input
    property= tx.property;
    //update  property status Intent For Sale
    property.status='Intent For Sale';

    // save the property
      const registry = await getAssetRegistry(propertylisting.getFullyQualifiedType());
      const exists = await registry.get(plid).catch(err => {
       // await registry.add(propertylisting)
      })
                                                   
        if(exists)
        {
            throw new Error('Propert with PLID already Exists in the Properties for Sale');
        }
      else
      {
        await registry.add(propertylisting);
        await registryproperty.update(property) ;

      }
}


/**
 * Create a new property
 * @param {org.property.registration.purchaseProperty} tx
 * @transaction
 */

async function purchaseProperty(tx){
    console.log('Property Purchase Transaction');
    
    //Get User details    
    const factory = getFactory();
    const NS = 'org.property.registration';
    const me = getCurrentParticipant();
     
        //Add property to Property Asset Registry
    const property = factory.newResource(NS, 'Property', tx.propertylisting.property.PID);
        //Add property to Property Listing Asset Registry
    const propertylisting = factory.newResource(NS, 'PropertyListing', tx.propertylisting.PLID);
     //Add property to owner user Registry
    let user = factory.newResource(NS, 'User', tx.propertylisting.property.owner.userId);
    //Add property to buyer user Registry
	let newOwner = factory.newResource(NS, 'User', me.userId);
  	newOwner = me;
  
      //update property details.
  	property.marketPrice = tx.propertylisting.property.marketPrice;
	property.regDate = tx.propertylisting.property.regDate;
	property.propertyType = tx.propertylisting.property.propertyType;
	property.location = tx.propertylisting.property.location;
    property.owner = me;
 	
            // creating registry for propertylisting
   	  const registrylisting = await getAssetRegistry(propertylisting.getFullyQualifiedType());
      
            //Check if the property exists;
      const existslisting = await registrylisting.get(tx.propertylisting.PLID).catch(err => {
       // await registry.add(propertylisting)
      })
      //Check the balance of the buyer if more than the market price of the property
        if(property.owner.balance >= tx.propertylisting.property.marketPrice)  {  
          	
          user=tx.propertylisting.property.owner;
          
          if (user.userId != newOwner.userId)
          {
            //Debit the price of the property from the buyer's account
            newOwner.balance = me.balance - tx.propertylisting.property.marketPrice;
            //credit it to the owner's account
            user.balance=user.balance + tx.propertylisting.property.marketPrice;
          }
          const registryuser = await getParticipantRegistry(user.getFullyQualifiedType());
          const registrynewowner = await getParticipantRegistry(newOwner.getFullyQualifiedType());
          
          const registry = await getAssetRegistry(property.getFullyQualifiedType());
                //Check if the property exists
                if(existslisting)
                {
                  const exists = await registry.get(tx.propertylisting.property.PID);  
                  //Add the new property owner to the property asset registry with the ‘Registered’ status      
                  exists? await registry.update(property) : await registry.add(property);
                  //Remove the property from the property listing registry
                  await registrylisting.remove(propertylisting) ;
                  await registryuser.update(user) ;
                  await registryuser.update(newOwner) ;
                }
                else
                {
                	 throw new Error('Propert with PID is not Intent for Sale');
                }	
        	}
        else
        {
          throw new Error('User accounrt balance is lower than marketPrice of the property');
        }
}