/*
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
 * Create a new property
 * @param {org.property.registration.intentForSale} tx
 * @transaction
 */

async function intentForSale(tx){
	console.log('Property Setting up for Sale Transaction');
    
    //Get User details    
    const factory = getFactory();
    const NS = 'org.property.registration';
    const me = getCurrentParticipant();
    const plid = tx.property.PID+Date.parse(new Date());    
        //Add property to Property Listing Asset Registry
    const propertylisting = factory.newResource(NS, 'PropertyListing', plid);
        propertylisting.property=tx.property;
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
        await registry.add(propertylisting)
      }
}


/**
 * Create a new property
 * @param {org.property.registration.purchaseProperty} tx
 * @transaction
 */

async function purchaseProperty(tx){
	console.log('Property Purchase Transaction');
	
}