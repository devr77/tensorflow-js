require('@tensorflow/tfjs-node');
const tf = require('@tensorflow/tfjs');

const loadCSV = require('./load-csv');

function knn(features, labels, predictionPoint, k) {

    ////Standardization////
// (Value - Average) / Standard Deviation

    const {mean, variance} = tf.moments(features, 0) // 0 or 1 depends on which axis
    const scaledPrediction = predictionPoint.sub(mean).div(variance.pow(0.5))

    return features
        .sub(mean)
        .div(variance.pow(0.5))
        .sub(scaledPrediction)
        .pow(2)
        .sum(1)
        .pow(0.5)
        .expandDims(1)
        .concat(labels, 1)
        .unstack()
        .sort((a, b) => a.dataSync()[0] > b.dataSync()[0] ? 1 : -1)
        .slice(0, k)
        .reduce((acc, pair) => acc + pair.dataSync()[1], 0) / k;
}

let {features, labels, testFeatures, testLabels} = loadCSV('kc_house_data.csv', {
    shuffle: true,
    splitTest: 10,
    dataColumns: ['lat', 'long', 'sqft_lot', 'sqft_living'],
    labelColumns: ['price']
});

features = tf.tensor(features);
labels = tf.tensor(labels);


testFeatures.forEach((testPoint, index) => {
    const result = knn(features, labels, tf.tensor(testPoint), 10);

//Calculating the error : (expected value - predicted value) / expected value
    const err = (testLabels[index][0] - result) / testLabels[index][0];


    //  console.log('Guess ',  result + '   Value ' + testLabels[0][0]);
    console.log('Error : ' + err * 100);
})




