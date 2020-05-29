import VueShepherd from 'vue-shepherd';

function createTour(tour,width,height,list){
    let elemnts=['column','winds','map'];
    let array=[];
    for (let key in list){
        if(list[key]!='none'){
            array.push(key);
        }
    }
    if (width>500){
        tour.addStep({
            attachTo: { element:'input.mapboxgl-ctrl-geocoder--input', on: 'right' },
            text: 'Performing a search by location and provides weather forecast accordingly',
            buttons: [
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
            if (array.length==0){
                    tour.addStep({
                        attachTo: { element:'.genericGraph', on: 'bottom' },
                        text: 'Shows the forecasted temperature at each hour of the day',
                        buttons: [
                            {
                                text: 'Done',
                                action: tour.next
                            }
                        ]
                    });
            }
        else{

            tour.addStep({
                attachTo: { element:'.genericGraph', on: 'bottom' },
                text: 'Shows the forecasted temperature at each hour of the day',
                buttons: [
                    {
                        text: 'Next',
                        action: tour.next
                    }
                ]
            });
            for (let i=0;i<array.length;i++){
                if(array[i]=='column'){
                    if (i==array.length-1){
                    tour.addStep({
                        attachTo: { element:'.card-heading.pt-3.pb-2', on: 'top' },
                        text: 'Provides data on relative humidity in the air',
                        buttons: [
                            {
                                text: 'Done',
                                action: tour.next
                            }
                        ]
                    });
                    }
                    else{
                        tour.addStep({
                        attachTo: { element:'.card-heading.pt-3.pb-2', on: 'top' },
                        text: 'Provides data on relative humidity in the air',
                        buttons: [
                            {
                                text: 'Next',
                                action: tour.next
                            }
                        ]
                        });
                    }

                }
                else if(array[i]=='winds'){
                    if(i==array.length-1){
                        tour.addStep({
                            attachTo: { element:'.windGraph', on: 'top' },
                            text: 'Provides on current direction of wind and its speed',
                            buttons: [
                                {
                                    text: 'Done',
                                    action: tour.next
                                }
                            ]
                        });
                     }
                    else{
                        tour.addStep({
                            attachTo: { element:'.windGraph', on: 'top' },
                            text: 'Provides on current direction of wind and its speed',
                            buttons: [
                                {
                                    text: 'Next',
                                    action: tour.next
                                }
                            ]
                        });

                    }
                }
        
                else{
                    if(i==array.length-1){
                        tour.addStep({
                        attachTo: { element:'.visibility', on: 'top' },
                        text: 'Shows the chosen location on a map',
                        buttons: [
                            {
                                text: 'Done',
                                action: tour.next
                            }
                        ]
                    });
                }
                else{
                    tour.addStep({
                        attachTo: { element:'.visibility', on: 'top' },
                        text: 'Shows the chosen location on a map',
                        buttons: [
                            {
                                text: 'Next',
                                action: tour.next
                            }
                        ]
                    });
                    }
                }
            }
        }
    }
    else{
        tour.addStep({
            attachTo: { element:'input.mapboxgl-ctrl-geocoder--input', on: 'bottom' },
            text: 'Performing a search by location and provides weather forecast accordingly',
            buttons: [
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
        tour.addStep({
            attachTo: { element:'.genericGraph', on: 'bottom' },
            text: 'Shows the forecasted temperature at each hour of the day',
            buttons: [
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
        tour.addStep({
            attachTo: { element:'.card-heading.pt-3.pb-2', on: 'top' },
            text: 'Provides data on relative humidity in the air',
            buttons: [
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
        tour.addStep({
            attachTo: { element:'.windGraph', on: 'top' },
            text: 'Provides on current direction of wind and its speed',
            buttons: [
                {
                    text: 'Done',
                    action: tour.next
                }
            ]
        });
    }
    
tour.start();
}
export {createTour};