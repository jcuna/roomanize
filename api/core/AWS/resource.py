from boto3.dynamodb.conditions import Key, Attr

from core.AWS.base import Base
from config import configs

class Resource(Base):

    def __init__(self):
        super().__init__()
        self.monthly_report_table = configs.AWS_MONTHLY_REPORT_TABLE

    def get_monthly_reports_table(self):
        return self.get_resource('dynamodb').Table(self.monthly_report_table)


    @staticmethod
    def query(table, key, value):
        return table.query(
            KeyConditionExpression=Key(key).eq(str(value))
        )

    @staticmethod
    def scan(table, key, value, limit=20, start_key=None):
        args = {
            'FilterExpression': Attr(key).eq(str(value)),
            'Limit': limit,
        }
        if start_key is not None:
            args['ExclusiveStartKey'] = start_key
        return table.scan(**args)

    def select_monthly_report(self, value):
        return self.query(self.get_monthly_reports_table(), 'date', value)

    def insert_monthly_report(self, value: dict):
        client = self.get_client('dynamodb')
        return client.put_item(
            TableName=self.monthly_report_table,
            Item=value
        )
