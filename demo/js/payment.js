angular.module('payment', ['dynamicForms'])
    .controller('PayController', function() {
        this.model = {

        };
    })
    .factory('PaymentModel', function() {
        var schema = [
            {
                column: 'paymentNumber',
                label: 'Payment number',
                validation: "<p>The payment number provided is invalid. It's the 10 digit number at the bottom of your bill.",
                help: "This is the ten digit number on the bottom of your bill."
            },
            {
                column: 'amount',
                label: 'Amount ($)',
                validators: {
                    "min": 0.01
                },
                validation: "<p>Please enter a valid payment amount.</p>",
                help: "This is the amount you want to pay."
            },
            {
                column: 'cardHolderName',
                label: 'Card holder name',
                validators: {
                    "maxlength": 60
                },
                validation: "<p>Please enter a valid card holders name.</p>",
                help: "This is the name on your card."
            },
            {
                column: 'cardNumber',
                label: 'Card number',
                validators: {
                    "maxlength": 60
                },
                validation: "<p>Please enter a valid credit or debit card number.</p>",
                help: "This is the number on your card."
            },
            {
                column: 'expiryMonth',
                label: 'Expiry month',
                validators: {},
                validation: "<p>Please enter an expiry month.</p>",
                help: "This is the number on your card."
            },
            {
                column: 'expiryYear',
                label: 'Expiry year',
                validators: {},
                validation: "<p>Please enter an expiry year.</p>",
                help: "This is the year on your card."
            },
            {
                column: 'cvv',
                label: 'Card verification value (CVV)',
                validators: {
                    "ng-minlength": 3,
                    "ng-maxlength": 4
                },
                validation: "<p>Your CVV is the last digits of the number on the reverse side of your card.</p>",
                help: "This is the {{cardType === 'amex' ? 4 : 3}}  digits on the back of your card."
            }
        ];

        return schema;
    });