import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export class GoFiberApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Create a VPC
		const vpc = new ec2.Vpc(this, "go-fiber-aws-vpc", {
			maxAzs: 2, // Specify the number of Availability Zones
		});

		// Create an ECS cluster
		const cluster = new ecs.Cluster(this, "go-fiber-aws-ecs", {
			vpc: vpc,
		});

		// Create an ECR repository
		const repository = new ecr.Repository(this, "go-fiber-aws-repos");

		// Create a load balancer
		const loadBalancer = new elbv2.ApplicationLoadBalancer(
			this,
			"MyLoadBalancer",
			{
				vpc: vpc,
				internetFacing: true,
			}
		);

		// Create a target group
		const targetGroup = new elbv2.ApplicationTargetGroup(
			this,
			"go-fiber-aws-target-group",
			{
				vpc: vpc,
				port: 8080,
				targetType: elbv2.TargetType.IP,
			}
		);

		// Create a listener
		const listener = loadBalancer.addListener("go-fiber-aws-listener", {
			port: 8080,
			defaultTargetGroups: [targetGroup],
		});

		// Create a task definition
		const taskDefinition = new ecs.FargateTaskDefinition(
			this,
			"MyTaskDefinition"
		);

		// Add a container to the task definition
		const container = taskDefinition.addContainer(
			"go-fiber-aws-container",
			{
				//image: ecs.ContainerImage.fromEcrRepository(repository),
				image: ecs.ContainerImage.fromAsset("../"),
				memoryLimitMiB: 512,
				cpu: 256,
			}
		);

		// Add a port mapping to the container
		container.addPortMappings({
			containerPort: 8080,
		});

		// Create a service
		const service = new ecs.FargateService(this, "go-fiber-aws-service", {
			cluster: cluster,
			taskDefinition: taskDefinition,
			desiredCount: 2,
			assignPublicIp: true,
			serviceName: "my-service",
		});

		// Register the service with the target group
		service.attachToApplicationTargetGroup(targetGroup);

		// Output the load balancer DNS name
		new cdk.CfnOutput(this, "LoadBalancerDNS", {
			value: loadBalancer.loadBalancerDnsName,
		});
	}
}
