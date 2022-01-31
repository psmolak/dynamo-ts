import {
    DynamoEntry, DynamoIndexes,
    DynamoMapDefinition,
} from "./type-mapping";
import {DynamoClientConfig, DynamoDefinition} from "./dynamo-client-config";
import {DocumentClient} from 'aws-sdk/lib/dynamodb/document_client';
import {ComparisonBuilder, conditionalParts} from "./comparison";
import {AttributeBuilder} from "./naming";
import {CompareWrapperOperator} from "./operation";
import {ProjectionHandler} from "./dynamo-getter";
import QueryInput = DocumentClient.QueryInput;
import ScanInput = DocumentClient.ScanInput;

export type ScanOptions<DEFINITION extends DynamoMapDefinition> = Omit<QueryInput, 'TableName'>  &
    {
        filter?:(compare: () => ComparisonBuilder<DEFINITION>) => CompareWrapperOperator<DEFINITION>
        next?: string
    }

export class DynamoScanner {

  static async scan
  <
      DEFINITION extends DynamoMapDefinition,
      HASH extends keyof DynamoEntry<DEFINITION>,
      RANGE extends keyof DynamoEntry<DEFINITION> | null,
        INDEXES extends DynamoIndexes<DEFINITION> = null,
      RETURN_OLD extends boolean = false
  > (
      config: DynamoClientConfig<DEFINITION>,
      definition: DynamoDefinition<DEFINITION, HASH, RANGE, INDEXES>,
      attributeBuilder: AttributeBuilder,
      options: ScanOptions<DEFINITION> = {}
  ) : Promise<{
    next?: string;
    member: { [K in keyof DynamoEntry<DEFINITION>]: DynamoEntry<DEFINITION>[K] }[];
  }> {
      const [attributes, projection] = ProjectionHandler.projectionFor(attributeBuilder, config.definition, options.ProjectionExpression);
      const {filter, next, ExpressionAttributeNames, ExpressionAttributeValues, ...extras} = options;
      const conditionPart = filter && conditionalParts(definition, attributes, filter);
      const scanInput: ScanInput = {
        TableName: config.tableName,
        ...(conditionPart ? {FilterExpression: conditionPart.expression} : {}),
        ProjectionExpression: projection,
        ...(next
            ? {
              ExclusiveStartKey: JSON.parse(
                  Buffer.from(next, 'base64').toString('ascii'),
              ),
            }
            : {}),
        ...extras,
        ...(conditionPart?.attributeBuilder ?? attributes).asInput({ExpressionAttributeNames, ExpressionAttributeValues})
      }
    if(config.logStatements) {
      console.log(`ScanInput: ${JSON.stringify(scanInput, null, 2)}`)
    }
    const result = await config.client.scan(scanInput).promise();
    return {
      member: (result.Items ?? []) as any,
      next: result.LastEvaluatedKey
          ? Buffer.from(JSON.stringify(result.LastEvaluatedKey!)).toString(
              'base64',
          )
          : undefined,
    };
  }

}