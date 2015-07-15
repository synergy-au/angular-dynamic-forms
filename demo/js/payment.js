angular.module('payment', ['dynamicForms'])
    .controller('PayController', function() {
        this.model = {
            paymentNumber: '1234567890',
            amount: '10.25',
            cardHolderName: 'Brian Foody',
            cardNumber: '1234123412341234',
            cvv: '123',
            expiryMonth: 12,
            expiryYear: 15
        };
    })
    .factory('PaymentModel', function() {
        var schema = [
            {
                show: '!<%= controller %>.existingAccount',
                name: 'paymentNumber',
                label: 'Payment number',
                validation: "<p>The payment number provided is invalid. It's the 10 digit number at the bottom of your bill.",
                help: "This is the ten digit number on the bottom of your bill."
            },
            {
                name: 'amount',
                label: 'Amount ($)',
                validators: {
                    "min": 0.01
                },
                validation: "<p>Please enter a valid payment amount.</p>",
                help: "This is the amount you want to pay."
            },
            {
                name: 'cardHolderName',
                label: 'Card holder name',
                validators: {
                    "maxlength": 60
                },
                validation: "<p>Please enter a valid card holders name.</p>",
                help: "This is the name on your card."
            },
            {
                name: 'cardNumber',
                label: 'Card number',
                validators: {
                    "maxlength": 60
                },
                validation: "<p>Please enter a valid credit or debit card number.</p>",
                help: "This is the number on your card."
            },
            {
                name: 'expiry',
                label: 'Expiry month',
                validators: {},
                validation: "<p>Please enter your expiry month and year.</p>",
                help: "This is the number on your card."
            },
            {
                name: 'cvv',
                label: 'Card verification value (CVV)',
                validators: {
                    "ng-minlength": 3,
                    "ng-maxlength": 4
                },
                validation: "<p>Your CVV is the last digits of the number on the reverse side of your card.</p>",
                help: "This is the {{<%= model %>.cvv === '999' ? 4 : 3}}  digits on the back of your card."
            }
        ];

        return schema;
    });