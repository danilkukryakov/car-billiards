import { PBRMaterial, Scene, Texture } from '@babylonjs/core';

import { grainedWoodTextures } from 'assets/textures/grained_wood';
import { groundTextures } from 'assets/textures/ground';
import { woodTextures } from 'assets/textures/wood';

export namespace PbrMaterials {

	/**
	 * Create ground material.
	 * @param scene Scene.
	 */
	export function createGroundMaterial(scene: Scene): PBRMaterial {
		const material = new PBRMaterial('pbrGroundMaterial', scene);
		const uvScale = 4;
		const textures: Texture[] = [];

		const diffuseTexture = new Texture(
			groundTextures.diffuseTexturePath,
			scene,
		);
		textures.push(diffuseTexture);
		material.albedoTexture = diffuseTexture;

		const aoTexture = new Texture(
			groundTextures.aoTexturePath,
			scene,
		);
		textures.push(aoTexture);
		material.ambientTexture = aoTexture;

		const normalTexture = new Texture(
			groundTextures.normalTexturePath,
			scene,
		);
		textures.push(normalTexture);
		material.bumpTexture = normalTexture;

		const metallicTexture = new Texture(
			groundTextures.roughnessTexturePath,
			scene,
		);
		textures.push(metallicTexture);
		material.metallicTexture = metallicTexture;
		material.useRoughnessFromMetallicTextureAlpha = true;

		textures.forEach(texture => {
			texture.uScale = uvScale;
			texture.vScale = uvScale;
		});

		return material;
	}

	/**
	 * Create wood material.
	 * @param scene Scene.
	 */
	export function createWoodMaterial(scene: Scene): PBRMaterial {
		const material = new PBRMaterial('pbrWoodMaterial', scene);

		material.albedoTexture = new Texture(
			woodTextures.diffuseTexturePath,
			scene,
		);

		material.bumpTexture = new Texture(
			woodTextures.normalTexturePath,
			scene,
		);

		material.invertNormalMapX = true;
		material.invertNormalMapY = true;

		material.metallicTexture = new Texture(
			woodTextures.armTexturePath,
			scene,
		);
		material.useAmbientOcclusionFromMetallicTextureRed = true;
		material.useRoughnessFromMetallicTextureGreen = true;
		material.useMetallnessFromMetallicTextureBlue = true;

		return material;
	}

	/**
	 * Create grained wood material.
	 * @param scene Scene.
	 */
	export function createGrainedWoodMaterial(scene: Scene): PBRMaterial {
		const material = new PBRMaterial('pbrGrainedWoodMaterial', scene);

		material.albedoTexture = new Texture(
			grainedWoodTextures.diffuseTexturePath,
			scene,
		);

		material.bumpTexture = new Texture(
			grainedWoodTextures.normalTexturePath,
			scene,
		);

		material.invertNormalMapX = true;
		material.invertNormalMapY = true;

		material.metallicTexture = new Texture(
			grainedWoodTextures.armTexturePath,
			scene,
		);
		material.useAmbientOcclusionFromMetallicTextureRed = true;
		material.useRoughnessFromMetallicTextureGreen = true;
		material.useMetallnessFromMetallicTextureBlue = true;

		return material;
	}
}
