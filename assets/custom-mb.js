document.addEventListener('DOMContentLoaded', function() {
    const currentVariant = JSON.parse(document.querySelector('variant-selects [data-selected-variant]').innerHTML);
    
    Shopify.theme.generateSellingPlanRadios = (variantId) => {
      const productId = document.querySelector('product-info')?.dataset.productId;
      let widgets = window.Recharge.widgets[productId];
      const variantSellingPlans = widgets.config.formattedVariantPrices[variantId]?.formattedSellingPlanPrices;
      let variantUnitPrice = widgets.config.formattedVariantPrices[variantId]?.unit;
      const radioContainer = document.getElementById('selling-plan-radios');
      radioContainer.innerHTML = ''; // Clear any existing radio buttons
      
      // Create the one-time purchase radio button
      const radioOneTime = document.createElement('input');
      radioOneTime.type = 'radio';
      radioOneTime.name = 'newPurchaseOption';
      radioOneTime.value = 'onetime';
      radioOneTime.id = 'rc-radio1';
      radioOneTime.checked = true;
      radioOneTime.dataset.price = variantUnitPrice;
  
      let labelOneTime = document.createElement('label');
      labelOneTime.htmlFor = 'rc-radio1';
      labelOneTime.innerHTML = `<span>${widgets.widgetSettings.onetime_message} ${variantUnitPrice}</span>`;
  
      // Append the one-time purchase option
      labelOneTime.insertBefore(radioOneTime, labelOneTime.firstChild);
      radioContainer.appendChild(labelOneTime);
      //radioContainer.appendChild(document.createElement('br'));
      // Check for variant selling plans
      if (variantSellingPlans) {
        Object.keys(variantSellingPlans).forEach(sellingPlanId => {
          const sellingPlan = variantSellingPlans[sellingPlanId];
  
          // Create the subscription purchase radio button
          const radioSubscription = document.createElement('input');
          radioSubscription.type = 'radio';
          radioSubscription.name = 'newPurchaseOption';
          radioSubscription.value = 'subscription';
          radioSubscription.id = `rc-radio2-${sellingPlanId}`;
          radioSubscription.dataset.price = sellingPlan.discounted;
          let currentPlan = widgets.product.plans.filter(plan => plan.external_plan_id == sellingPlanId)[0];
          const frequencyText = `${currentPlan.order_interval_frequency} ${currentPlan.interval_unit}${currentPlan.order_interval_frequency > 1 ? 's' : ''}`;
          let subscriptionSave = parseFloat(variantUnitPrice.match(/[\d\.]+/g)) - parseFloat(sellingPlan.discounted.match(/[\d\.]+/g));
          let labelSubscription = document.createElement('label');
          labelSubscription.htmlFor = `rc-radio2-${sellingPlanId}`;
          labelSubscription.innerHTML = `<div class="bs-devshop__main-subscription">
            <div class="bs-devshop__subscription-option">
           
              <span class="bs-devshop__subscription_text">Upgrade to sub & <span class="bs-devshop_sc_price">Save ${sellingPlan.discountValue}%</span>!</span>
              <span class="bs-devshop__subscription__pricing_wrapper">
              <span class="bs-devshop__subscription-pricing">
                <span class="bs-devshop__saving">${widgets.storeSettings.store_currency.currency_symbol}${subscriptionSave.toFixed(2)} off!</span> 
                <strike>${variantUnitPrice}</strike> 
                ${sellingPlan.discounted}
              </span>
              <span class="bs-devshop__subscription_interval">${frequencyText}</span>
              </span>
            </div>
            <span class="bs-devshop__sub-text hidden">Get Sabre consistently and never run out of peak performance. Cancel anytime.</span>
          </div>`;
  
          // Append the subscription option
          labelSubscription.insertBefore(radioSubscription, labelSubscription.firstChild);
          radioContainer.appendChild(labelSubscription);
          //radioContainer.appendChild(document.createElement('br'));
        });
      }
      radioContainer.addEventListener('change', function(e) {
        if (e.target.name === 'newPurchaseOption') {
          getCheckedPurchaseOption();
        }
      });
    }
  
    function getCheckedPurchaseOption() {
      let checkedRadio = document.querySelector('input[name="newPurchaseOption"]:checked');
      let realSubscription = document.querySelector(`input[name="purchaseOption"][value=${checkedRadio.value}]`);
      if (realSubscription) {
        realSubscription.checked = true;
        const event = new Event('change', { bubbles: true });
        realSubscription.dispatchEvent(event);
        document.querySelectorAll('input[name="newPurchaseOption"]').forEach(radio => {
          if (radio !== realSubscription) {
            radio.closest('label').querySelector('.bs-devshop__sub-text')?.classList.add('hidden');
          }
        });
        checkedRadio.closest('label').querySelector('.bs-devshop__sub-text.hidden')?.classList.remove('hidden');
      }
    }
    setTimeout(function(){
      Shopify.theme.generateSellingPlanRadios(currentVariant.id);
      getCheckedPurchaseOption();
    }, 1000)
})